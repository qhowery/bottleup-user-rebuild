import { select, supabase, theme, usePurchaseStore, useStore } from "@/globals";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { format, isSameDay, isSameMonth } from "date-fns";
import AppText from "@/components/AppText";
import Divider from "@/components/Divider";
import Section from "@/components/Section";
import GradientOutlineButton from "@/components/GradientOutlineButton";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Toast from "react-native-toast-message";

export default function EventDetail(props: { route: any }) {
  const events = useStore(state => state.events);
  const eventID = usePurchaseStore(state => state.eventID);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID) ?? null, [events, eventID]);
  const updateSingleEvent = useStore(state => state.updateSingleEvent);
  const navigation = useNavigation<any>();
  const startDate = useMemo(() => purchaseEvent === null ? null : new Date(purchaseEvent.start), [purchaseEvent]);
  const endDate = useMemo(() => purchaseEvent === null ? null : new Date(purchaseEvent.end), [purchaseEvent]);
  const [showMoreDescription, setShowMoreDescription] = useState(true);


  const isAllSoldOut = useMemo(() => {
    if(purchaseEvent === null) {
      return false;
    }

    for(const listing of purchaseEvent.listings) {
      if(listing.currInventory !== 0) {
        return false;
      }
    }
    return true;
  }, [purchaseEvent]);


  const isAllExpired = useMemo(() => {
    if(purchaseEvent === null) {
      return false;
    }

    for(const listing of purchaseEvent.listings) {
      if(new Date(listing.purchaseTimeLimit).getTime() > Date.now()) {
        return false;
      }
    }
    return true;
  }, [purchaseEvent])


  const minTablePrice = useMemo(() => {
    if(purchaseEvent === null) {
      return null;
    }
    const tablePrices = purchaseEvent.listings.filter(d => d.type === 0 && d.currInventory !== 0 && new Date(d.purchaseTimeLimit).getTime() > Date.now()).map(d => d.price/100);
    if(tablePrices.length === 0) {
      return null;
    }
    else {
      return Math.min(...tablePrices);
    }
  }, [purchaseEvent]);

  const minTicketPrice = useMemo(() => {
    if(purchaseEvent === null) {
      return null;
    }
    const ticketPrices = purchaseEvent.listings.filter(d => d.type === 1 && d.currInventory !== 0 && new Date(d.purchaseTimeLimit).getTime() > Date.now()).map(d => d.price/100);
    if(ticketPrices.length === 0) {
      return null;
    }
    else {
      return Math.min(...ticketPrices);
    }
  }, [purchaseEvent]);


  const fetchNewEvent = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select(select.event)
      .eq('id', eventID)
      .single();

    // manage case where no event with specified id exists
    if(error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load event'
      })
      return;
    }

    // @ts-ignore, supabase type checker doesn't work for venue join.
    updateSingleEvent(data);
  }, []);


  // navigation handlers
  const handleTableNavigation = useCallback(() => {
    navigation.navigate('ServicePurchase', { listing: 'table' })
  }, []);

  const handleTicketNavigation = useCallback(() => {
    navigation.navigate('ServicePurchase', { listing: 'ticket' })
  }, []);

  const handleOfferNavigation = useCallback(() => {
    navigation.navigate('RequestOffer', { disconnectOnGoBack: true, venueID: purchaseEvent!.venue.id, eventID: eventID });
  }, []);


  useEffect(() => {
    fetchNewEvent();
  }, []);

  // checks if purchase is null or if venue object isn't of type Venue
  if(purchaseEvent === null || startDate === null || endDate === null) {
    return null;
  }

  return <View style={styles.container}>
    <Image style={styles.bg} source={purchaseEvent.flyer} contentFit={'cover'} contentPosition={'top center'} />

    <AppSafeAreaView edges={['top', 'left', 'right']}>

      {/* Options and close buttons */}
      <View style={styles.topButtons}>
        {/*<Pressable hitSlop={10}>*/}
        {/*  <View style={styles.semiTransparentButton}>*/}
        {/*     remove options button */}
        {/*    <MaterialCommunityIcons name={'dots-horizontal'} size={24} color={theme.color.text} />*/}
        {/*  </View>*/}
        {/*</Pressable>*/}
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <View style={styles.semiTransparentButton}>
            <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
          </View>
        </Pressable>
      </View>

      {/* header with event name and date */}
      <View style={styles.header}>
        <View style={styles.date}>
          <AppText size={'small'} color={'secondary'}>{format(startDate, 'EEE')}</AppText>
          <AppText color={'primary'}>{format(startDate, 'MMM').toUpperCase()}</AppText>
          <AppText size={'large'}>{format(startDate, 'd')}</AppText>
        </View>
        <AppText font={'heavy'}>{purchaseEvent.name}</AppText>
      </View>

      <Divider />

      <ScrollView style={styles.scrollView}>

        {/* icon with context */}
        <Section style={styles.detailPartContainer}>
          <View style={styles.detailPart}>
            <MaterialCommunityIcons name={'map-marker-outline'} size={20} color={theme.color.secondary} />
            <View>
              <AppText size={'small'}>{purchaseEvent.venue.name}</AppText>
              <AppText color={'secondary'} size={'small'}>{purchaseEvent.venue.address}</AppText>
            </View>
          </View>

          {purchaseEvent.performer !== '' && <View style={styles.detailPart}>
            <MaterialCommunityIcons name={'music'} size={20} color={theme.color.secondary} />
            <AppText size={'small'}>{purchaseEvent.performer}</AppText>
          </View>}

          <View style={styles.detailPart}>
            <MaterialCommunityIcons name={'clock-outline'} size={20} color={theme.color.secondary} />
            <AppText size={'small'}>{(() => {
              // case where date is same
              if(isSameDay(startDate, endDate)) {
                return `${format(startDate, 'MMM d')}, ${format(startDate, 'h:mm aaa')} - ${format(endDate, 'h:mm aaa')}`;
              }

              // case where month is the same (so date needs to be in a range)
              else if(isSameMonth(startDate, endDate)) {
                return `${format(startDate, 'MMM d')}-${format(endDate, 'd')}, ${format(startDate, 'h:mm aaa')} - ${format(endDate, 'h:mm aaa')}`;
              }

              // case where months are different
              else {
                return `${format(startDate, 'MMM d')}-${format(endDate, 'MMM d')}, ${format(startDate, 'h:mm aaa')} - ${format(endDate, 'h:mm aaa')}`;
              }
            })()}</AppText>
          </View>
        </Section>

        <Divider />

        {/* collapsible description */}
        <Section style={styles.description}>
          <AppText size={'small'} numberOfLines={showMoreDescription ? 0 : 5}>{purchaseEvent.description}</AppText>
          {/*<Pressable onPress={() => setShowMoreDescription(prev => !prev)} hitSlop={15}>*/}
          {/*  <AppText size={'small'} color={'primary'} >{showMoreDescription ? 'Show less' : 'Show more'}</AppText>*/}
          {/*</Pressable>*/}
        </Section>

        {
          isAllSoldOut
            ? (
              <View style={styles.bannerSoldOut}>
                <AppText size={'small'} font={'black'} style={styles.bannerText}>
                  SOLD OUT
                </AppText>
              </View>
            )
            : isAllExpired
            ? (
              <View style={styles.bannerExpired}>
                <AppText size={'small'} font={'black'} color={'bgDark'} style={styles.bannerText}>
                  Booking time has expired
                </AppText>
              </View>
            )
            : <Divider />
        }
        <Divider />

        {/* services */}
        <AppText preset={'secondary header'} style={styles.servicesHeader}>Services</AppText>
        <View style={styles.servicesContainer}>
          <View style={styles.servicePart}>
            <MaterialCommunityIcons name={'table-chair'} size={20} color={theme.color.table} />
            <View style={styles.servicePartStack}>
              <AppText font={'heavy'}>Tables</AppText>
              <AppText size='small' color={'secondary'}>{minTablePrice === null ? 'None available' : `from \$${minTablePrice % 1 === 0 ? minTablePrice : minTablePrice.toFixed(2)}`}</AppText>
            </View>
            <GradientOutlineButton onPress={handleTableNavigation} style={styles.gradientButton} active={minTablePrice !== null}>
              <AppText size={'small'} font={'black'}>Select</AppText>
            </GradientOutlineButton>
          </View>

          <View style={styles.servicePart}>
            <MaterialCommunityIcons name={'ticket-outline'} size={20} color={theme.color.ticket} />
            <View style={styles.servicePartStack}>
              <AppText font={'heavy'}>Tickets</AppText>
              <AppText size='small' color={'secondary'}>{minTicketPrice === null ? 'None available' : `from \$${minTicketPrice % 1 === 0 ? minTicketPrice : minTicketPrice.toFixed(2)}`}</AppText>
            </View>
            <GradientOutlineButton onPress={handleTicketNavigation} style={styles.gradientButton} active={minTicketPrice !== null}>
              <AppText size={'small'} font={'black'}>Select</AppText>
            </GradientOutlineButton>
          </View>

          <View style={styles.servicePart}>
            <MaterialCommunityIcons name={'message-text-outline'} size={20} color={theme.color.chat} />
            <View style={styles.servicePartStack}>
              <AppText font={'heavy'}>Request custom offer</AppText>
              {
                !purchaseEvent.allowOffers && (
                  <AppText size='small' color={'secondary'}>Disabled by venue</AppText>
                )
              }
            </View>
            <GradientOutlineButton onPress={handleOfferNavigation} style={styles.gradientButton} active={purchaseEvent.allowOffers}>
              <AppText size={'small'} font={'black'}>Select</AppText>
            </GradientOutlineButton>
          </View>
        </View>
      </ScrollView>
    </AppSafeAreaView>
  </View>
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexGrow: 1
  },
  bg: {
    position: 'absolute',
    width: '100%',
    height: 160
  },
  scrollView: {
    flexGrow: 1
  },
  scrollViewPoster: {
    minHeight: '100%'
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10
  },
  semiTransparentButton: {
    width: 30,
    height: 30,
    // backgroundColor: theme.color.semiTransparentBlack,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    borderTopRightRadius: theme.radius.extraBig,
    borderTopLeftRadius: theme.radius.extraBig,
    width: '100%',
    backgroundColor: theme.color.bg,
    paddingVertical: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center'
  },
  date: {
    alignItems: 'flex-start',
    gap: -4
  },
  detailPartContainer: {
    gap: 30,
  },
  detailPart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 13,
  },
  description: {
    gap: 12
  },
  bannerSoldOut: {
    alignSelf: 'stretch',
    backgroundColor: theme.color.textBad,
    height: 25,
    alignItems: 'center'
  },
  bannerText: {
    top: 2
  },
  bannerExpired: {
    alignSelf: 'stretch',
    backgroundColor: theme.color.primary,
    height: 25,
    alignItems: 'center'
  },
  servicesHeader: {
    marginBottom: 12
  },
  servicesContainer: {
    gap: 40,
    marginHorizontal: 20,
    alignSelf: 'stretch',
    marginBottom: 20
  },
  servicePart: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    flex: 1,
    alignSelf: 'stretch'
  },
  servicePartStack: {
    gap: -3,
    flexGrow: 1
  },
  gradientButton: {
    height: 45,
    width: 130
  }
});