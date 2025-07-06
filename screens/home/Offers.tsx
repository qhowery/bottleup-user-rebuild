import { StyleSheet, View } from "react-native";
import { ChannelList } from "stream-chat-expo";
import { useCallback, useEffect, useState } from "react";
import { streamChatClient, supabase, theme, useAuthStore } from "@/globals";
import RequiredAuthAlert from "@/components/RequiredAuthAlert";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "@/components/AppText";


export default function Offers() {
  const signedIn = useAuthStore(state => state.signedIn);
  const userInfo = useAuthStore(state => state.userInfo);
  const [userCredentials, setUserCredentials] = useState<null | { id: string, token: string }>(null);
  const [connected, setConnected] = useState(false);
  const navigation = useNavigation<any>();


  // load user ID. this convoluted setup is needed so userID is accessible in the ChannelList component as well as when we're logging in.
  useEffect(() => {
    const getStreamChatCredentials = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, streamChatToken')
        .single();
      if(error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: 'Failed to get user chat credentials.'
        });
        return;
      }

      setUserCredentials({ id: data.id, token: data.streamChatToken });
    }

    if(signedIn) {
      getStreamChatCredentials();
    }
  }, [signedIn]);


  // ensure logged in to stream chat
  useEffect(() => {
    if(signedIn && userInfo !== null && userCredentials !== null) {
      console.log('connecting');
      const connect = async () => {
        // don't connect user if we are already connected
        if(streamChatClient.user === undefined) {
          await streamChatClient.connectUser(
            {
              id: userCredentials.id,
              name: userInfo.firstName + ' ' + userInfo.lastName,

            },
            userCredentials.token
          );
          setConnected(true);
        }
      };

      try {
        connect();
      }
      catch(e) {
        console.error(e);
        Toast.show({
          type: 'error',
          text1: 'Failed to load messages.'
        });
      }

      // disconnect
      return () => {
        streamChatClient.disconnectUser();
      };
    }
  }, [signedIn, userInfo, userCredentials]);


  const handleSelect = useCallback(() => {
    // todo - set purchase store data from channel info
    // navigation.navigate('RequestOffer', { disconnectOnGoBack: false });
  }, []);


  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateInner}>
        <MaterialCommunityIcons name={'forum-outline'} color={theme.color.primary} size={100} />
        <AppText style={{ textAlign: 'center' }}>No messages yet</AppText>
        <AppText size={'small'} color={'secondary'} style={{ textAlign: 'center' }}>Support requests to event and venue staff will show up here.</AppText>
      </View>
    </View>
  ), []);


  // todo - setup sort (and security stuff?) for listing user's channels WHILE filtering out expired events
  return <View style={styles.container}>
    {
      !signedIn
      ? <RequiredAuthAlert />
      : !connected
      ? null
      : <ChannelList
          filters={{
            members: { $in: [userCredentials!.id] }
          }}
          sort={{ last_message_at: -1 }}
          options={{ limit: 20, message_limit: 30 }}
          onSelect={handleSelect}
          EmptyStateIndicator={renderEmptyState}
        />
    }
  </View>
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.color.bgTint
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  emptyStateInner: {
    gap: 10,
    alignItems: 'center',
    maxWidth: 200,
    marginBottom: 50
  }
})