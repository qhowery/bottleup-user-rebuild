import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Cost, endpoints, supabase, theme, useAuthStore, usePurchaseStore, useStore } from "@/globals";
import {StackActions, useNavigation} from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import AppText from "@/components/AppText";
import Header from "@/components/Header";
import { useCallback, useEffect, useMemo, useState } from "react";
import EventInfoBar from "@/components/purchase/EventInfoBar";
import Divider from "@/components/Divider";
import Section from "@/components/Section";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSlideOver from "@/components/BottomSlideOver";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Toast from "react-native-toast-message";

export default function Cart() {
  const events = useStore(state => state.events);
  const eventID = usePurchaseStore(state => state.eventID);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID)!, [events, eventID]);  const purchaseCart = usePurchaseStore(state => state.cart);
  const updateCart = usePurchaseStore(state => state.updateCart);
  const orderID = usePurchaseStore(state => state.orderID);
  const orderAge = usePurchaseStore(state => state.orderAge);
  const clearOrderID = usePurchaseStore(state => state.clearOrderID);
  const signedIn = useAuthStore(state => state.signedIn);
  const userInfo = useAuthStore(state => state.userInfo);
  const navigation = useNavigation<any>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [showPurchaseTerms, setShowPurchaseTerms] = useState(false);
  const [showDepositExplanation, setShowDepositExplanation] = useState(false);
  const [cost, setCost] = useState<null | Cost>(null);
  const [doneInitializing, setDoneInitializing] = useState(false);


  // all of this happens when the screen is loaded - responsible for intializing order
  const init = async () => {
    // checks if the order is at risk of being stale - if so, redirects to the event page for a new order to be created.
    if(orderAge!.getTime() + 1000*60*60*20 < new Date().getTime()) { // 20 hour age (vs. 24 hours when order is declared style automatically
      const action = StackActions.pop(2);
      navigation.dispatch(action);
      // declare stale order id asynchronously
      fetch(endpoints.checkout.declareStale, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderID: orderID
        })
      });
      clearOrderID();
      return;
    }

    // calculate cost of everything attached to order
    const calculateCostRes = await fetch(endpoints.checkout.calculateOrderCost, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderID: orderID
      })
    });

    if(calculateCostRes.status === 400) {
      const message = await calculateCostRes.text();
      if(message === 'Purchase time limit expired') {
        Toast.show({
          type: 'error',
          text1: 'Time to purchase listing has expired.'
        });
        navigation.dispatch(StackActions.pop(2));
        return;
      }
    }
    else if(calculateCostRes.status !== 200) {
      Toast.show({
        type: 'error',
        text1: 'Failed to calculate order cost.'
      })
      console.error(await calculateCostRes.text());
      return;
    }

    setCost(await calculateCostRes.json());


    // if we're signed in, prepare payment by attaching user to order
    if(!signedIn) {
      return;
    }

    const { data: { session }, error: refreshSessionError } = await supabase.auth.refreshSession();
    if(refreshSessionError) {
      console.error(refreshSessionError);
      Toast.show({
        type: 'error',
        text1: 'Failed to prepare order payment.'
      });
      return;
    }

    // todo - handle error state from this
    const preparePaymentRes = await fetch(endpoints.checkout.prepareOrderPayment, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session!.access_token}`
      },
      body: JSON.stringify({
        orderID: orderID
      })
    });
    const { paymentIntentClientSecret, ephemeralKey, customer: stripeCustomerID }: { paymentIntentClientSecret: string, ephemeralKey: string, customer: string } = await preparePaymentRes.json();


    // initialize stripe payment sheet ui
    const { error } = await initPaymentSheet({
      merchantDisplayName: "BottleUp",
      customerId: stripeCustomerID,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntentClientSecret,
      allowsDelayedPaymentMethods: false,
      appearance: {
        font: {
          family: Platform.OS === 'android' ? undefined : theme.fontFamily.medium
        },
        shapes: {
          borderRadius: theme.radius.standard
        },
        colors: {
          primary: theme.color.primary,
          background: theme.color.bg,
          componentBackground: theme.color.bgTint,
          componentBorder: theme.color.bgBorder,
          componentDivider: theme.color.bgBorder,
          primaryText: theme.color.text,
          secondaryText: theme.color.secondary,
          componentText: theme.color.text,
          placeholderText: theme.color.secondary,
          icon: theme.color.text
        },
        primaryButton: {
          colors: {
            background: theme.color.bgPayment,
            text: theme.color.text
          }
        }
      }
    });
    if(error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to initialize payment sheet.'
      })
      console.error(error);
      return;
    }


    setDoneInitializing(true);
  };


  useEffect(() => {
    console.log('Re-initializing');
    init();
  }, [signedIn, userInfo]);


  // handle go back button - also clears cart
  const handleGoBack = useCallback(async () => {
    navigation.goBack();
    await Promise.all(purchaseCart.map(async (cartItem) => {
      const updateOrderRes = await fetch(endpoints.checkout.updateOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order: orderID,
          listing: cartItem.listing.id,
          quantity: -9999
        })
      });
      if(updateOrderRes.status !== 200) {
        Toast.show({
          type: 'error',
          text1: 'Failed to update order.'
        })
        return;
      }
      const newCart = await updateOrderRes.json();
      updateCart(newCart);
    }));
  }, []);


  // handles user details button interaction
  const handleBuyerDetails = useCallback(async () => {
    if(signedIn) {
      // todo - link this to a "user details only" screen
    }
    else {
      navigation.navigate('PhoneNumber');
    }
  }, [signedIn]);


  const openPaymentSheet = useCallback(async () => {
    if(!doneInitializing) {
      return;
    }

    const { error } = await presentPaymentSheet();

    if(error) {
      if(error.code === 'Failed') {
        Toast.show({
          type: 'error',
          text1: 'Payment method failed.'
        })
      }
      // otherwise, payment was cancelled so nothing at all happens
      return;
    }

    navigation.reset({
      index: 1,
      routes: [
        { name: 'HomeLayout' },
        { name: 'PurchaseConfirmed', params: { orderID } }
      ],
    });
  }, [doneInitializing]);


  // standard formatting function for cost in cents
  const formatCents = useCallback((cents: number) => {
    return '$' + (cents/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);


  // guard against accessing cart out of order
  if(purchaseEvent === null) {
    console.error('Cart was accessed without a valid purchase event');
    navigation.navigate('HomeLayout');
    return null;
  }


  return <AppSafeAreaView>
    <Header title={purchaseEvent.name} leftButtonHandler={handleGoBack} leftButton={'close'} />

    <EventInfoBar />

    <Divider />

    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>

      {/* items in cart */}
      {/*<AppText preset={'secondary header'}>Item</AppText>*/}
      {/*{purchaseCart.map((d, i) => <Fragment key={d.listing.id+d.quantity+(i+1 === purchaseCart.length)}>*/}
      {/*  <Section style={styles.cartItem} color={'primary'}>*/}
      {/*    <View style={styles.cartItemQuantity}>*/}
      {/*      <AppText font={'heavy'}>{d.quantity}</AppText>*/}
      {/*      <AppText size={'small'} font={'heavy'}>QTY.</AppText>*/}
      {/*    </View>*/}
      {/*    <AppText>{d.listing.name}</AppText>*/}
      {/*  </Section>*/}
      {/*  {i+1 !== purchaseCart.length && <Divider />}*/}
      {/*</Fragment>)}*/}
      {/*<Divider />*/}

      {/* buyer details */}
      <AppText preset={'secondary header'} style={styles.headerWithBottomMargin}>Buyer details</AppText>
      <Pressable onPress={handleBuyerDetails} style={styles.buyerDetailsContainer}>
        <AppText size={'small'} color={'text'}>Contact details:</AppText>
        <View style={styles.buyerDetailsContainerLeft}>
          {
            signedIn
              ? <AppText size={'small'} color={'text'} font={'heavy'}>{userInfo!.firstName} {userInfo!.lastName}</AppText>
              : <AppText size={'small'} color={'textBad'} font={'heavy'}>Required</AppText>
          }
          <MaterialCommunityIcons name={'chevron-right'} size={24} color={theme.color.secondary} />
        </View>
      </Pressable>
      <Divider />

      {/* payment totals */}
      <AppText preset={'secondary header'} style={styles.headerWithBottomMargin}>Payment</AppText>
      <View style={styles.paymentContainer}>
        <View style={styles.paymentRow}>
          <AppText style={styles.paymentRowLabel} size={'small'} color={'secondary'}>{purchaseCart[0]?.quantity}x {purchaseCart[0]?.listing.name}:</AppText>
          <AppText size={'small'}>{cost === null ? '$XXX.XX' : formatCents(cost.subtotal)}</AppText>
        </View>
        <View style={styles.paymentRow}>
          <View style={styles.bookingDepositOverflowHider}>
            <Pressable onPress={() => setShowDepositExplanation(true)} hitSlop={13} style={styles.bookingDepositDashed}>
              <AppText style={styles.paymentRowLabel}  size={'small'} color={'secondary'}>Booking deposit:</AppText>
            </Pressable>
          </View>
          <AppText size={'small'}>{cost === null ? '$XXX.XX' : formatCents(cost.bookingDeposit)}</AppText>
        </View>
        <View style={styles.paymentRow}>
          <AppText style={styles.paymentRowLabel} size={'small'} color={'secondary'}>Sales tax:</AppText>
          <AppText size={'small'}>{cost === null ? '$XXX.XX' : formatCents(cost.salesTax)}</AppText>
        </View>
        <View style={[styles.paymentRow, styles.totalRow]}>
          <AppText font={'black'}>TOTAL:</AppText>
          <AppText font={'black'}>{cost === null ? '$XXX.XX' : formatCents(cost.total)}</AppText>
        </View>
      </View>
      <Divider />
      <Section color={'primary'}>
        <View style={styles.paymentRow}>
          <AppText font={'heavy'}>Payable at the venue:</AppText>
          <AppText font={'heavy'}>{cost === null ? '$XXX.XX' : formatCents(cost.payableAtVenue)}</AppText>
        </View>
        <View style={styles.paymentRow}>
          <AppText font={'heavy'} color={'textPayment'}>Due now:</AppText>
          <AppText font={'heavy'} color={'textPayment'}>{cost === null ? '$XXX.XX' : formatCents(cost.dueNow)}</AppText>
        </View>
      </Section>
      <Divider />

      {/* payment buttons */}
      <View style={styles.bottomButtonsSpacer} />
      <Pressable style={styles.viewPurchaseTerms} onPress={() => setShowPurchaseTerms(true)}>
        <AppText size={'small'}>View purchase policy</AppText>
      </Pressable>
      <Pressable style={[styles.bookNow, !doneInitializing ? styles.bookNowDisabled : null]} onPress={openPaymentSheet}>
        <View style={styles.bookNowSideContainer}>
          <MaterialCommunityIcons name={'lock-outline'} color={theme.color.text} size={20} />
        </View>
        <AppText font={'heavy'} color={'text'}>Book now</AppText>
        <View style={styles.bookNowSideContainer} />
      </Pressable>

    </ScrollView>

    {/* booking deposit explanation slideover */}
    <BottomSlideOver show={showDepositExplanation} setShow={setShowDepositExplanation} style={styles.slideover}>
      <View style={styles.slideoverHeader}>
        <AppText size={'small'} color={'secondary'}>Booking deposit</AppText>
      </View>
      <View style={styles.slideoverBody}>
        <AppText size={'small'}>Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.</AppText>
      </View>
    </BottomSlideOver>

    {/* purchase terms slideover */}
    <BottomSlideOver show={showPurchaseTerms} setShow={setShowPurchaseTerms} style={styles.slideover}>
      <View style={styles.slideoverHeader}>
        <AppText size={'small'} color={'secondary'}>Purchase policy</AppText>
      </View>
      <View style={styles.slideoverBody}>
        <AppText size={'small'}>{purchaseCart[0]?.listing.purchasePolicy}</AppText>
      </View>
      {/*<View style={styles.termsCheckout}>*/}
      {/*  <GradientOutlineButton background={'bgDark'} onPress={openPaymentSheet} style={styles.termsCheckoutButton}>*/}
      {/*    <AppText size={'small'} font={'black'}>Proceed to checkout</AppText>*/}
      {/*  </GradientOutlineButton>*/}
      {/*</View>*/}
    </BottomSlideOver>

  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1
  },
  scrollViewContent: {
    flexGrow: 1
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
  },
  cartItemQuantity: {
    alignItems: 'center',
    gap: -4
  },
  headerWithBottomMargin: {
    marginBottom: 12
  },
  buyerDetailsContainer: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.big,
    height: 60,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24
  },
  buyerDetailsContainerLeft: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentContainer: {
    gap: 5,
    paddingBottom: 16,
    paddingHorizontal: 30
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8
  },
  paymentRowLabel: {
    flexShrink: 1
  },
  bookingDepositOverflowHider: {
    overflow: 'hidden',
    position: 'relative',
    left: -2,
  },
  bookingDepositDashed: {
    borderWidth: 1,
    borderColor: theme.color.secondary,
    borderStyle: 'dashed',
    margin: -2,
    padding: 2,
    marginBottom: 2
  },
  totalRow: {
    marginTop: 8
  },
  bottomButtonsSpacer: {
    flexGrow: 1
  },
  viewPurchaseTerms: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  bookNow: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.bgPayment,
    flexDirection: 'row',
    marginHorizontal: 12,
    borderRadius: theme.radius.standard,
    marginBottom: 18
  },
  bookNowDisabled: {
    opacity: 0.35
  },
  bookNowSideContainer: {
    flexBasis: 44,
    flexShrink: 1,
    minWidth: 16
  },
  slideover: {
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 20
  },
  slideoverHeader: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 30
  },
  slideoverBody: {
    gap: 12,
    marginBottom: 24,
    height: 40
  },
  // termsCheckout: {
  //   justifyContent: 'center',
  //   flexDirection: 'row'
  // },
  // termsCheckoutButton: {
  //   height: 50,
  //   width: 200,
  // }
})