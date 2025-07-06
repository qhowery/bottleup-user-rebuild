import { StyleSheet, View } from "react-native";
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { Event, theme } from "@/globals";
import AppText from "./AppText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";

export default function EventCard(props: { event: Event, showDate?: boolean, padRight?: boolean }) {
  const currDate = useMemo(() => new Date(props.event.start), [props.event.start]);
  const minTablePrice = useMemo(() => {
    const tablePrices = props.event.listings.filter(d => d.type === 0 && d.currInventory !== 0 && new Date(d.purchaseTimeLimit).getTime() > Date.now()).map(d => d.price/100);
    if(tablePrices.length === 0) {
      return null;
    }
    else {
      return Math.min(...tablePrices);
    }
  }, [props.event]);

  const minTicketPrice = useMemo(() => {
    const ticketPrices = props.event.listings.filter(d => d.type === 1 && d.currInventory !== 0 && new Date(d.purchaseTimeLimit).getTime() > Date.now()).map(d => d.price/100);
    if(ticketPrices.length === 0) {
      return null;
    }
    else {
      return Math.min(...ticketPrices);
    }
  }, [props.event]);

  return <View style={[styles.event, props.padRight === true ? styles.eventPadRight : null]}>
    {props.showDate === true && <View style={styles.dateHeader}>
      <AppText font={'din'}>
        <AppText font={'din'}>{format(currDate, 'EEE').toUpperCase()},</AppText>
        {/* trick to format with space between text elements */} <AppText font={'din'} color={'primary'}>{format(currDate, 'MMM').toUpperCase()}</AppText>
        {/* trick to format with space between text elements */} <AppText font={'din'}>{format(currDate, "d")}</AppText>
      </AppText>
    </View>}
    <Image source={props.event.flyer} style={[styles.flyer, props.showDate === true ? styles.flyerDateHeader : {}]} contentFit='cover' contentPosition='top center' />
    <AppText style={styles.eventName} font='heavy'>{props.event.name}</AppText>
    <AppText style={styles.details} color='secondary' size='small'>{`${props.event.venue.name} •`} {format(new Date(props.event.start), 'h:mm aa')}</AppText>

    <View style={styles.prices}>
      <View style={styles.pricesHalved}>
        <View style={styles.priceContainerLeft}>
          <MaterialCommunityIcons name='table-chair' size={16} color={theme.color.table} />
          <AppText size='small' font='black' color={minTablePrice === null ? 'secondary' : 'text'}>{minTablePrice === null ? 'None' : `from \$${minTablePrice % 1 === 0 ? minTablePrice : minTablePrice.toFixed(2)}`}</AppText>
          <View style={styles.rightSpaceFiller} />
        </View>
      </View>

      <View style={styles.pricesHalved}>
        <View style={styles.priceContainerRight}>
          <MaterialCommunityIcons name='ticket-outline' size={16} color={theme.color.ticket} />
          <AppText size='small' font='black' color={minTicketPrice === null ? 'secondary' : 'text'}>{minTicketPrice === null ? 'None' : `from \$${minTicketPrice % 1 === 0 ? minTicketPrice : minTicketPrice.toFixed(2)}`}</AppText>
          <View style={styles.rightSpaceFiller} />
        </View>
      </View>
    </View>
  </View>
}

const styles = StyleSheet.create({
  event: {
    flex: 0.5,
    borderColor: theme.color.bgBorder,
    borderWidth: 1,
    borderRadius: theme.radius.standard,
    alignItems: 'center',
    backgroundColor: theme.color.bg
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: '100%'
  },
  eventPadRight: {
    marginRight: 10
  },
  flyer: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: theme.radius.standard,
    borderTopRightRadius: theme.radius.standard,
    marginBottom: 15
  },
  flyerDateHeader: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  },
  eventName: {
    paddingHorizontal: 10,
    marginBottom: 5
  },
  details: {
    paddingHorizontal: 10,
    marginBottom: 15
  },
  prices: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  pricesHalved: {
    width: '50%',
  },
  priceContainerLeft: {
    flexDirection: 'row',
    borderColor: theme.color.bgBorderMuted,
    borderWidth: 1,
    borderRadius: theme.radius.standard,
    padding: 8,
    marginRight: 4,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  priceContainerRight: {
    flexDirection: 'row',
    borderColor: theme.color.bgBorderMuted,
    borderWidth: 1,
    borderRadius: theme.radius.standard,
    padding: 8,
    marginLeft: 4,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tableIcon: {
    color: theme.color.text,
    fontSize: theme.fontSize.small,
  },
  ticketIcon: {
    color: theme.color.text,
    fontSize: theme.fontSize.small,
  },
  priceText: {
    justifyContent: 'center',
    flexDirection: 'row'
  },
  rightSpaceFiller: {
    flexShrink: 1
  }
})