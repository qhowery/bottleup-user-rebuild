import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { theme, usePurchaseStore, useStore } from "@/globals";
import AppText from "@/components/AppText";
import { format, isSameDay, isSameMonth } from "date-fns";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import BottomSlideOver from "@/components/BottomSlideOver";
import Divider from "@/components/Divider";
import Section from "@/components/Section";

export default function EventInfoBar() {
  const events = useStore(state => state.events);
  const eventID = usePurchaseStore(state => state.eventID);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID)!, [events, eventID]);  const [show, setShow] = useState(false);
  const startDate = useMemo(() => purchaseEvent === null ? null : new Date(purchaseEvent.start), [purchaseEvent]);
  const endDate = useMemo(() => purchaseEvent === null ? null : new Date(purchaseEvent.end), [purchaseEvent]);

  if(purchaseEvent === null || startDate === null || endDate === null) {
    console.error('Purchase event is null - it should have been set before EventInfoBar was mounted');
    return null;
  }

  return <View style={styles.container}>
    <Image source={purchaseEvent.flyer} style={styles.image} contentPosition={'center'} contentFit={'cover'} />
    <View style={styles.textStack}>
      <AppText size={'small'} font={'heavy'}>{purchaseEvent.name}</AppText>
      <AppText size={'small'} font={'medium'} color={'secondary'}>
        {format(startDate, 'EEE, MMM d')} at {format(startDate, 'h aaa')} | {purchaseEvent.venue.name}
      </AppText>
    </View>
    <Pressable onPress={() => setShow(true)} hitSlop={10}>
      <MaterialCommunityIcons name={'information-outline'} color={theme.color.text} size={20} />
    </Pressable>

    {/* from EventDetails screen */}
    <BottomSlideOver show={show} setShow={setShow}>
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
        <AppText size={'small'}>{purchaseEvent.description}</AppText>
      </Section>
    </BottomSlideOver>
  </View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: theme.radius.small
  },
  textStack: {
    gap: -3,
    flexGrow: 1
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
    paddingBottom: 7,
    paddingTop: 20
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
});