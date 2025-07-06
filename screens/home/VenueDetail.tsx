import { Event, select, supabase, theme, usePurchaseStore, useStore } from "@/globals";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import AppText from "@/components/AppText";
import { useCallback, useEffect, useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialTabBar, MaterialTabBarProps, Tabs } from "react-native-collapsible-tab-view"
import { useNavigation } from "@react-navigation/native";
import EventCard from "@/components/EventCard";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Toast from "react-native-toast-message";

export default function VenueDetail(props: { route: any }) {
  const venueID = props.route.params.venueID;
  const setEventID = usePurchaseStore(state => state.setEventID);
  const venues = useStore(state => state.venues);
  const venue = useMemo(() => venues.find(d => d.id === venueID)!, [venues,  venueID]);
  const [events, setEvents] = useState<Event[]>([]);
  const navigation = useNavigation<any>();
  const [showMoreDescription, setShowMoreDescription] = useState(false);

  const renderTabBar = useCallback((props: MaterialTabBarProps<any>) => <MaterialTabBar
    {...props}
    getLabelText={text => String(text)}
    style={styles.tabStyle}
    labelStyle={styles.labelStyle}
    activeColor={theme.color.text}
    inactiveColor={theme.color.text}
    indicatorStyle={styles.indicatorStyle}
  />, []);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select(select.event)
      .eq('venue', venue.id)
      .order('start', { ascending: false });

    if(error !== null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load events.'
      })
      return;
    }

    // @ts-ignore, supabase type checker doesn't work for venue join.
    setEvents(data);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  return <View style={styles.container}>
    <Image style={styles.bg} source={venue.banner} contentFit={'cover'} contentPosition={'top center'} />

    <AppSafeAreaView edges={['top', 'left', 'right']}>

      {/* Options and close buttons */}
      <View style={styles.topButtons}>
        {/*<Pressable hitSlop={10}>*/}
        {/*  <View style={styles.semiTransparentButton}>*/}
        {/*    <MaterialCommunityIcons name={'dots-horizontal'} size={24} color={theme.color.text} />*/}
        {/*  </View>*/}
        {/*</Pressable>*/}
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <View style={styles.semiTransparentButton}>
            <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
          </View>
        </Pressable>
      </View>

      {/* Info header */}
      <View style={styles.header}>
        <View style={styles.info}>
          <Image style={styles.avatar} source={venue.avatar} contentFit='cover' contentPosition={'center'} />
          <View style={styles.rightInfo}>
            <AppText font='heavy'>{venue.name}</AppText>
            <AppText size='small' color='secondary'>{venue.type} • Text Example • {'$'.repeat(venue.cost)}</AppText>
          </View>
        </View>
      </View>

      <Tabs.Container
        renderTabBar={renderTabBar}
      >

        {/* events tab */}
        <Tabs.Tab name="Events">
          <Tabs.FlatList
            style={styles.events}
            contentContainerStyle={styles.eventsContainer}
            data={events}
            renderItem={d => <Pressable onPress={() => {
              setEventID(d.item.id);
              navigation.navigate('EventDetail');
            }}>
              <EventCard event={d.item} showDate />
            </Pressable>}
          />
        </Tabs.Tab>

        {/* details tab */}
        <Tabs.Tab name="Details">
          <Tabs.FlatList
            data={[null]}
            renderItem={() => <View style={styles.detailsContainer}>

              {/* description */}
              <AppText style={styles.description} numberOfLines={showMoreDescription ? 0 : 4} size={'small'}>{venue.description}</AppText>
              <Pressable onPress={() => setShowMoreDescription(prev => !prev)} hitSlop={15}>
                <AppText style={styles.descriptionShowMore} size={'small'} color={'primary'}>{showMoreDescription ? 'Show less' : 'Show more'}</AppText>
              </Pressable>

              {/* icon with context */}
              <View style={styles.detailPartContainer}>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'map-marker-outline'} size={20} color={theme.color.secondary} />
                  <View>
                    <AppText size={'small'}>{venue.name}</AppText>
                    <AppText color={'secondary'} size={'small'}>{venue.address}</AppText>
                  </View>
                </View>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'compass-outline'} size={20} color={theme.color.secondary} />
                  <AppText size={'small'}>{venue.neighborhood}</AppText>
                </View>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'store-outline'} size={20} color={theme.color.secondary} />
                  <AppText size={'small'}>{venue.type === 'lounge' ? 'Lounge' : 'Unknown'}</AppText>
                </View>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'tag-outline'} size={20} color={theme.color.secondary} />
                  <AppText size={'small'}>{'$'.repeat(venue.cost)}</AppText>
                </View>
              </View>
            </View>}
          />
        </Tabs.Tab>
      </Tabs.Container>

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
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  info: {
    flexDirection: 'row',
    gap: 25,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  rightInfo: {
    gap: -2
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
  events: {
    flexGrow: 1,
    backgroundColor: theme.color.bgTint,
    paddingVertical: 30,
  },
  eventsContainer: {
    paddingHorizontal: 15,
    gap: 30,
    paddingBottom : 60
  },
  detailsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 30,
    width: '100%'
  },
  description: {
    marginBottom: 16
  },
  descriptionShowMore: {
    marginBottom: 30
  },
  detailPartContainer: {
    gap: 30,
  },
  detailPart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 13,
  }
});