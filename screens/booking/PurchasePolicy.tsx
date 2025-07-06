import { useNavigation } from "@react-navigation/native";
import { useStore } from "@/globals";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import AppText from "@/components/AppText";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function PurchasePolicy(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const navigation = useNavigation<any>();
  const userOrders = useStore(state => state.userOrders);
  const userOrder = userOrders.find(d => d.id === orderID)!;


  // handlers
  const handleHeaderBack = useCallback(() => {
    navigation.goBack();
  }, []);


  return <AppSafeAreaView>
    <Header title={'Details'} leftButton={'chevron-left'} leftButtonHandler={handleHeaderBack} />
    <RowSectionHeaderSpacer />

    <ScrollView contentContainerStyle={styles.contentContainer}>
      {
        userOrder.order_listings.map(d => <View style={styles.policy}>
          <AppText color={'secondary'} size={'small'}>Purchase policy for {d.listing.name}:</AppText>
          <AppText size={'small'}>{d.listing.purchasePolicy}</AppText>
        </View>)
      }
    </ScrollView>
  </AppSafeAreaView>
}


const styles = StyleSheet.create({
  contentContainer: {
    marginHorizontal: 15
  },
  policy: {
    gap: 12
  }
})