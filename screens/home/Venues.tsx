import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { select, supabase, theme, useStore } from "@/globals";
import { Image } from "expo-image";
import AppText from "@/components/AppText";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

export default function Venues() {
  const venues = useStore(state => state.venues);
  const setVenues = useStore(state => state.setVenues);
  const navigation = useNavigation<any>();

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from('venues')
      .select(select.venue);

    if(error !== null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load venues.'
      })
      return;
    }

    setVenues(data);
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  return <View>
    <FlatList
      data={venues}
      style={styles.venues}
      contentContainerStyle={styles.venuesContainer}
      renderItem={d => <Pressable hitSlop={10} onPress={() => navigation.navigate('VenueDetail', { venueID: d.item.id })}>
        <View style={[styles.venue, d.index === 0 ? styles.venueNoTopBorder : undefined]}>
          <Image style={styles.banner} source={d.item.banner} contentFit='cover' contentPosition='top center' />
          <View style={styles.info}>
            <Image style={styles.avatar} source={d.item.avatar} contentFit='cover' contentPosition={'center'} />
            <View style={styles.rightInfo}>
              <AppText font='heavy'>{d.item.name}</AppText>
              <AppText size='small' color='secondary'>{d.item.type} • {d.item.neighborhood} • {'$'.repeat(d.item.cost)}</AppText>
            </View>
          </View>
        </View>
      </Pressable>}
    />
  </View>
}

const styles = StyleSheet.create({
  venues: {
    backgroundColor: theme.color.bgTint,
    height: '100%'
  },
  venuesContainer: {
    gap: 20
  },
  venue: {
    backgroundColor: theme.color.bg,
    gap: 8,
    paddingBottom: 8,
    borderTopColor: theme.color.bgBorder,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.bgBorder
  },
  venueNoTopBorder: {
    borderTopWidth: 0
  },
  banner: {
    width: '100%',
    height: 120
  },
  info: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
  name: {

  },
  details: {

  }
})