import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import Header from "@/components/Header";
import { useCallback, useEffect, useMemo } from "react";
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from "@react-navigation/native";
import { supabase, theme, useAuthStore, Order, useStore, select } from "@/globals";
import Divider from "@/components/Divider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isSameDay, isSameMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import openMap from 'react-native-open-maps';
import Toast from "react-native-toast-message";


export default function BookingDetail(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const userOrders = useStore(state => state.userOrders);
  const userOrder = userOrders.find(d => d.id === orderID);
  const setSingleUserOrder = useStore(state => state.setSingleUserOrder);
  const userInfo = useAuthStore(state => state.userInfo);
  const navigation = useNavigation<any>();
  const startDate = useMemo(() => new Date(userOrder?.event.start ?? new Date()), [userOrder]);
  const endDate = useMemo(() => new Date(userOrder?.event.end ?? new Date()), [userOrder]);
  const location = useStore(state => state.userLocation);
  const timezone = location?.timezone ?? 'Etc/UTC';


  const handleHeaderLeftButton = useCallback(() => {
    navigation.goBack();
  }, []);


  // update user order details for this orderID
  const fetchOrderDetails = async () => {
    const { data, error }: { data: Order | null, error: any } = await supabase
      .from('orders')
      .select(select.order)
      .eq('id', orderID)
      .single();

    if(error || data === null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load order details.'
      });
      return;
    }

    setSingleUserOrder(data);
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [])


  // button handlers for actions
  const handleDirections = useCallback(() => {
    openMap({ query: userOrder?.venue.address });
  }, [userOrder]);

  const handleDetails = useCallback(() => {
    navigation.navigate('BookingMoreDetails', { orderID });
  }, []);


  return <AppSafeAreaView>
    <Header title={''} leftButtonHandler={handleHeaderLeftButton} leftButton={'chevron-left'} />

    <View style={styles.qrCode}>
      <QRCode
        size={180}
        value={orderID}
        quietZone={20}
        color={theme.color.bg}
      />
    </View>
    <Divider />

    <View style={styles.name}>
      <AppText font={'din'} size={"larger"}>{userInfo?.firstName} {userInfo?.lastName}</AppText>
    </View>
    <Divider />
    
    <View style={styles.buttons}>
      <Pressable style={styles.button} onPress={handleDirections}>
        <MaterialCommunityIcons name={'navigation-outline'} size={20} color={theme.color.text} />
        <AppText size={'small'}>Directions</AppText>
      </Pressable>
      <Pressable style={styles.button} onPress={handleDetails}>
        <MaterialCommunityIcons name={'dots-horizontal'} size={20} color={theme.color.text} />
        <AppText size={'small'}>More details</AppText>
      </Pressable>
    </View>
    <Divider />

    <ScrollView style={styles.details} contentContainerStyle={styles.detailsContainer}>
      <View style={styles.detailSection}>
        <AppText color={'secondary'} size={'small'}>Event</AppText>
        <AppText size={'small'} font={'heavy'}>{userOrder?.event.name}</AppText>
      </View>

      <View style={styles.detailSection}>
        <AppText color={'secondary'} size={'small'}>Item</AppText>
        <AppText size={'small'} font={'heavy'}>{userOrder?.order_listings[0]?.quantity}x  {userOrder?.order_listings[0]?.listing.name}</AppText>
      </View>

      <View style={styles.detailSection}>
        <AppText color={'secondary'} size={'small'}>Description</AppText>
        <AppText size={'small'} font={'heavy'}>{userOrder?.order_listings[0]?.listing.description}</AppText>
      </View>

      <View style={styles.detailSection}>
        <AppText color={'secondary'} size={'small'}>Event Date</AppText>
        <AppText size={'small'} font={'heavy'}>{(() => {
          // case where date is same
          if(isSameDay(startDate, endDate)) {
            return `${formatInTimeZone(startDate, timezone, 'MMM d, h:mm aaa')} - ${formatInTimeZone(endDate, timezone, 'h:mm aaa')}`;
          }

          // case where month is the same (so date needs to be in a range)
          else if(isSameMonth(startDate, endDate)) {
            return `${formatInTimeZone(startDate, timezone, 'MMM d')}-${formatInTimeZone(endDate, timezone, 'd')}, ${formatInTimeZone(startDate, timezone, 'h:mm aaa')} - ${formatInTimeZone(endDate, timezone, 'h:mm aaa')}`;
          }

          // case where months are different
          else {
            return `${formatInTimeZone(startDate, timezone, 'MMM d')}-${formatInTimeZone(endDate, timezone, 'MMM d')}, ${formatInTimeZone(startDate, timezone, 'h:mm aaa')} - ${formatInTimeZone(endDate, timezone, 'h:mm aaa')}`;
          }
        })()}</AppText>
      </View>
    </ScrollView>

  </AppSafeAreaView>
}


const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  qrCode: {
    marginVertical: 20,
    alignItems: 'center',
    alignSelf: 'center'
  },
  name: {
    marginVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center'
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 12
  },
  button: {
    alignItems: 'center'
  },
  details: {
    marginHorizontal: 18,
    flexShrink: 1
  },
  detailsContainer: {
    paddingVertical: 12,
    gap: 18
  },
  detailSection: {

  }
})