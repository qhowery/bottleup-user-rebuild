import { FlatList, Pressable, StyleSheet, View } from "react-native";
import AppText from "@/components/AppText";
import { select, supabase, theme, useStore } from "@/globals";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Toast from "react-native-toast-message";

export default function Location() {
  const locations = useStore(state => state.locations);
  const setLocations = useStore(state => state.setLocations);
  const setUserLocation = useStore(state => state.setUserLocation);
  const navigation = useNavigation<any>();

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select(select.location);

    if(error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load locations.'
      });
      return;
    }

    setLocations(data);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return <AppSafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
    <View style={styles.root}>
      <View style={styles.whereContainer}>
        <AppText size='small' font='heavy'>Where to?</AppText>
      </View>
      <View style={styles.divider} />
      <FlatList
        contentContainerStyle={styles.locations}
        data={locations}
        renderItem={({ item }) => <Pressable hitSlop={15} onPress={() => {
          setUserLocation(item);
          navigation.navigate('HomeLayout');
        }}>
          <AppText style={styles.location}>
            {item.name}
          </AppText>
        </Pressable>}
      />
    </View>
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.color.bg
  },
  root: {
    paddingTop: 20,
    flexGrow: 1,
    paddingHorizontal: 28
  },
  whereContainer: {
    width: '100%',
    height: 55,
    backgroundColor: theme.color.bgTint,
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.color.bgBorderMuted,
    marginTop: 40
  },
  locations: {
    gap: 40,
    paddingTop: 40,
    alignItems: 'center',
  },
  location: {

  }
})