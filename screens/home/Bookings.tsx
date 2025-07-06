import { ListRenderItemInfo, Pressable, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialTabBar, MaterialTabBarProps, Tabs } from "react-native-collapsible-tab-view"
import { supabase, theme, Order, useStore, select } from "@/globals";
import { useNavigation } from "@react-navigation/native";
import { formatInTimeZone } from 'date-fns-tz'
import AppText from "@/components/AppText";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";


export default function Bookings() {
  const navigation = useNavigation<any>();
  const renderTabBar = useCallback((props: MaterialTabBarProps<any>) => <MaterialTabBar
    {...props}
    getLabelText={text => String(text)}
    style={styles.tabStyle}
    labelStyle={styles.labelStyle}
    activeColor={theme.color.text}
    inactiveColor={theme.color.text}
    indicatorStyle={styles.indicatorStyle}
  />, []);
  const userOrders = useStore(state => state.userOrders);
  const setUserOrders = useStore(state => state.setUserOrders);
  const userLocation = useStore(state => state.userLocation);
  const refundTriggered = useStore(state => state.refundTriggered);
  const setRefundTriggered = useStore(state => state.setRefundTriggered);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const timezone = userLocation?.timezone ?? 'Etc/UTC';


  // sort bookings for the upcoming and past tabs
  const userOrdersUpcoming = useMemo(() =>
    userOrders
      .filter(d => new Date(d.event.end).getTime()+1000*60*60 >= new Date().getTime()) // 1 hour padding
      .sort((a, b) => new Date(a.event.start).getTime() - new Date(b.event.start).getTime()),
  [userOrders]);

  const userOrdersPast = useMemo(() =>
      userOrders
        .filter(d => new Date(d.event.end).getTime()+1000*60*60 < new Date().getTime()) // 1 hour padding
        .sort((a, b) => new Date(a.event.start).getTime() - new Date(b.event.start).getTime()),
    [userOrders]);


  // fetch user orders
  const getUserOrders = async () => {
    const { data, error }: any = await supabase // any is required as currently the typing doesn't recognize eventminimal correctly
      .from('orders')
      .select(select.order)
      .eq('state', 2);

    if(error || data === null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load bookings.'
      })
      return;
    }

    setUserOrders(data);
  };

  // refetches at first load, and when the screen is notified of a refund
  useEffect(() => {
    if(isFirstLoad) {
      getUserOrders();
      setIsFirstLoad(false);
    }
    else if(refundTriggered) {
      getUserOrders();
      setRefundTriggered(false);
    }
  }, [isFirstLoad, refundTriggered]);


  // renders standard booking component
  const renderBooking = useCallback((d: ListRenderItemInfo<Order>) => (
    <Pressable style={styles.booking} onPress={() => navigation.navigate('BookingDetail', { orderID: d.item.id })}>
      <MaterialCommunityIcons name={'circle'} size={8} color={new Date(d.item.event.start).getTime()-1000*60*60 <= new Date().getTime() && new Date(d.item.event.end).getTime()+1000*60*60 >= new Date().getTime() ? theme.color.primary : theme.color.bg} />

      <View style={styles.date}>
        <AppText size={'small'} color={'secondary'}>{formatInTimeZone(new Date(d.item.event.start), timezone, 'EEE')}</AppText>
        <AppText size={'small'} color={'primary'}>{formatInTimeZone(new Date(d.item.event.start), timezone, 'MMM').toUpperCase()}</AppText>
        <AppText size={'small'}>{formatInTimeZone(new Date(d.item.event.start), timezone, 'd')}</AppText>
      </View>

      <Image style={styles.image} source={d.item.event.flyer} contentFit={'cover'} contentPosition={'top center'} />

      <View style={styles.details}>
        <AppText size={'small'} font={'heavy'}>{d.item.event.name}</AppText>
        <AppText size={'small'} color={'secondary'}>{d.item.venue.name} • {formatInTimeZone(new Date(d.item.event.start), timezone, 'h:mm aa')}</AppText>
      </View>
    </Pressable>
  ), []);


  return <View style={styles.container}>
    <Tabs.Container
      renderTabBar={renderTabBar}
    >
      {/* upcoming tab */}
      <Tabs.Tab name="Upcoming">
        <Tabs.FlatList
          style={styles.tab}
          contentContainerStyle={styles.tabContainer}
          data={userOrdersUpcoming}
          renderItem={renderBooking}
        />
      </Tabs.Tab>

      {/* past tab */}
      <Tabs.Tab name="Past">
        <Tabs.FlatList
          style={styles.tab}
          contentContainerStyle={styles.tabContainer}
          data={userOrdersPast}
          renderItem={renderBooking}
        />
      </Tabs.Tab>
    </Tabs.Container>
  </View>
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  tab: {
    flexGrow: 1,
    backgroundColor: theme.color.bgTint,
    paddingTop: 15
  },
  tabContainer: {
    gap: 15,
    paddingBottom: 30
  },
  tabStyle: {
    backgroundColor: theme.color.bg
  },
  labelStyle: {
    fontFamily: theme.fontFamily.medium,
    color: theme.color.text,
    fontSize: theme.fontSize.small
  },
  indicatorStyle: {
    backgroundColor: theme.color.text,
  },
  booking: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.color.bgBorder,
    backgroundColor: theme.color.bg,
    paddingVertical: 15,
    paddingLeft: 5,
    paddingRight: 15,
    alignItems: 'center'
  },
  date: {
    paddingLeft: 8,
    paddingRight: 20,
    gap: -3
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.small
  },
  details: {
    paddingLeft: 20
  }
});