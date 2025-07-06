import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useState } from  "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { format } from 'date-fns';
import { select, supabase, theme, usePurchaseStore, useStore } from '@/globals';
import EventCard from "@/components/EventCard";
import AppText from "@/components/AppText";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

export default function Events() {
  const events = useStore(state => state.events);
  const userLocation = useStore(state => state.userLocation);
  const setEvents = useStore(state => state.setEvents);
  const setEventID = usePurchaseStore(state => state.setEventID);
  const [selectedDay, setSelectedDay] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const daySelection = useMemo(() => new Array(20).fill(null).map((_, i) => {
    const date = new Date(selectedDay);
    date.setDate(date.getDate()+i);
    return date;
  }), []);
  const daySelectionRef = useRef<FlatList>(null);
  const navigation = useNavigation<any>();


  // we have to pre fetch the venue id's for the location because for some reason there's no way to filter on a
  // joined column
  const fetchEvents = useCallback(async () => {
    if(userLocation === null) {
      return;
    }

    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('location', userLocation!.id);

    if(venueError) {
      console.error('failed to load venues');
      console.error(venueError);
      Toast.show({
        type: 'error',
        text1: 'Failed to load events.'
      });
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .select(select.event)
      .order('start', { ascending: false })
      .in('venue', venueData.map(d => d.id));

    if(error !== null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load events.'
      });
      console.error(error);
      return;
    }

    // @ts-ignore, supabase type checker doesn't work for venue join.
    setEvents(data);
  }, [userLocation]);

  useEffect(() => {
    fetchEvents();
  }, [userLocation]);


  return <View style={styles.root}>
    <FlatList
      horizontal
      data={daySelection}
      ref={daySelectionRef}
      style={styles.daySelection}
      directionalLockEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.daySelectionContent}
      renderItem={({ item, index }) => <Pressable
        key={item.getTime()}
        onPress={() => {
          daySelectionRef.current!.scrollToIndex({ index: index, animated: true, viewPosition: 0.5 });
          setSelectedDay(item);
        }}
      >
        <View style={[styles.day, selectedDay.getTime() === item.getTime() ? styles.dayActive : null]}>
          <AppText color='secondary' font='din'>{format(item, 'EEE')}</AppText>
          <View style={styles.monthDay}>
            <AppText color='primary' font='din'>{format(item, 'MMM').toUpperCase()}</AppText>
            <AppText font='din'>{format(item, 'd')}</AppText>
          </View>
        </View>
      </Pressable>}
    />
    <FlatList
      data={events}
      renderItem={d => <Pressable onPress={() => {
        setEventID(d.item.id);
        navigation.navigate('EventDetail');
      }}>
        <EventCard event={d.item} padRight={false} />
      </Pressable>}
      numColumns={1}
      // columnWrapperStyle={{ justifyContent:'space-between' }}
      style={styles.events}
      key={1}
      contentContainerStyle={styles.eventsContainer}
    />
  </View>
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.color.bg,
    flex: 1,
  },
  daySelection: {
    height: 70,
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.bgBorder,
    flexShrink: 1,
    flexGrow: 0
  },
  daySelectionContent: {
    alignItems: 'stretch',
    paddingHorizontal: 15,
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    borderBottomWidth: 2,
    borderBottomColor: theme.color.bg,
    height: '100%'
  },
  dayActive: {
    borderBottomColor: theme.color.text
  },
  monthDay: {
    gap: 4,
    flexDirection: 'row',
    paddingBottom: 3
  },
  events: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.color.bgTint,
  },
  eventsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 30,
    gap: 30
  }
});