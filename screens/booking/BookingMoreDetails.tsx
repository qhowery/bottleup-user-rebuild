import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import { useCallback, useMemo, useState } from "react";
import { StackActions, useNavigation } from "@react-navigation/native";
import Divider from "@/components/Divider";
import RowSection from "@/components/RowSection";
import { Linking } from "react-native";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import { endpoints, supabase, useStore } from "@/globals";
import ConfirmationSlideOver from "@/components/ConfirmationSlideOver";
import Toast from "react-native-toast-message";
import { formatInTimeZone } from "date-fns-tz";

export default function BookingMoreDetails(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const navigation = useNavigation<any>();
  const userOrders = useStore(state => state.userOrders);
  const userOrder = userOrders.find(d => d.id === orderID)!;
  const setRefundTriggered = useStore(state => state.setRefundTriggered);
  const [showRefundSlideOver, setShowRefundSlideOver] = useState(false);
  const location = useStore(state => state.userLocation);
  const timezone = location?.timezone ?? 'Etc/UTC';

  // cost formula is taken directly from cart
  const cost = useMemo(() => {
    let subtotal = 0;
    let bookingDeposit = 0;
    let payableAtVenue = 0;
    let dueNow = 0;
    let salesTax = 0;
    for(const d of userOrder.order_listings) {
      // price is price*quantity rounded to nearest cents
      const price = Math.round(d.listing.price*d.quantity!);
      subtotal += price;
      // deposit is 5% of price rounded to nearest cents
      const deposit = Math.round(price*0.05);
      bookingDeposit += deposit;
      // if collect in person, price is added to payable at venue
      if(d.listing.collectInPerson) {
        payableAtVenue += price;
      }
      // otherwise, we collect in app
      else {
        dueNow += price;
      }

      // sales tax is applied as percentage on top of price+fee
      const tax = Math.round((price+deposit)*userOrder.venue.salesTax);
      salesTax += tax;

      // booking deposit and sales tax is always in app
      dueNow += deposit + tax;
    }

    return {
      subtotal,
      bookingDeposit,
      salesTax,
      total: subtotal+bookingDeposit+salesTax,
      payableAtVenue,
      dueNow
    }
  }, [userOrder]);




  // handlers
  const handleHeaderBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleOrderBreakdown = useCallback(() => {
    navigation.navigate('BookingBreakdown', { orderID });
  }, []);

  const handlePurchasePolicy = useCallback(() => {
    navigation.navigate('PurchasePolicy', { orderID });
  }, []);

  const handleContactOrganizer = useCallback(() => {
    Linking.openURL(encodeURI(`mailto:${userOrder.venue.supportEmail}?subject=Support request for ${userOrder.event.name} - BottleUp`));
  }, []);

  const handleRequestRefund = useCallback(() => {
    setShowRefundSlideOver(true);
  }, []);


  // refund order
  const refundOrder = useCallback(async () => {
    if(userOrder === null) {
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
    const refundOrderRes = await fetch(endpoints.checkout.refundOrder, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session!.access_token}`
      },
      body: JSON.stringify({
        orderID: orderID
      })
    });

    // hide slideover once done processing
    setShowRefundSlideOver(false);

    if(refundOrderRes.status !== 200) {
      const message = await refundOrderRes.text();
      if(message === 'Refund period expired') {
        Toast.show({
          type: 'error',
          text1: 'The refundable period has expired.'
        });
        return;
      }

      console.error('Failed to refund order');
      console.error(message);
      Toast.show({
        type: 'error',
        text1: 'Failed to refund order.'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Refund successful!'
    });

    // removes this order from bookings so it can't get double refunded. also triggers a refresh for bookings to
    // re-fetch updated order data
    setRefundTriggered(true);

    const leaveBookingScreens = StackActions.pop(2);
    navigation.dispatch(leaveBookingScreens);
  }, []);


  return <AppSafeAreaView>
    <Header title={'Details'} leftButton={'chevron-left'} leftButtonHandler={handleHeaderBack} />
    <RowSectionHeaderSpacer />
    <Divider />

    <RowSection text={'Order breakdown'} handler={handleOrderBreakdown} />
    <Divider />

    <RowSection text={'Purchase policy'} handler={handlePurchasePolicy} />
    <Divider />

    <RowSection text={'Contact organizer'} handler={handleContactOrganizer} />
    <Divider />

    <RowSection text={'Request refund'} handler={handleRequestRefund} />
    <Divider />

    <ConfirmationSlideOver show={showRefundSlideOver}
                           setShow={setShowRefundSlideOver}
                           title={'Confirm refund'}
                           body={`You will be refunded the subtotal and sales tax of $${((cost.subtotal+cost.salesTax)/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, not including the booking fee. All listings bought in this order will be cancelled. You may only request a refund before ${formatInTimeZone(userOrder.order_listings[0].listing.refundTimeLimit, timezone, 'MMM d, h:mm aaa')}.`}
                           rightButtonHandle={refundOrder}
                           leftButtonText={'Cancel'}
                           rightButtonText={'Request refund'}
    />
  </AppSafeAreaView>
}