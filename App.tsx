// import 'expo-dev-client';
import AppText from "@/components/AppText";
import UniversalStripeProvider from '@/components/UniversalStripeProvider';
import { streamChatClient, supabase, theme, useAuthStore } from "@/globals";
import Root from '@/screens/Root';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { ToastConfig } from "react-native-toast-message";
import { Chat, DeepPartial, OverlayProvider, Theme } from "stream-chat-expo";


// if (Platform.OS !== 'web') {
//   const { StripeProvider } = require('@stripe/stripe-react-native');
//   // Use StripeProvider only in native
// }

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.color.bg
  }
}


const chatTheme: DeepPartial<Theme> = {
  colors: {
    accent_blue: theme.color.primary,
    accent_green: theme.color.success,
    accent_red: theme.color.textBad,
    bg_gradient_end: '#F7F7F7',
    bg_gradient_start: '#FCFCFC',
    black: theme.color.text,
    blue_alice: '#E9F2FF',
    border: '#00000014', // 14 = 8% opacity; top: x=0, y=-1; bottom: x=0, y=1
    grey: theme.color.secondary,
    grey_dark: '#72767E',
    grey_gainsboro: theme.color.chatBg,
    grey_whisper: '#ECEBEB',
    icon_background: '#FFFFFF',
    label_bg_transparent: '#00000033', // 33 = 20% opacity
    light_gray: '#DBDDE1',
    modal_shadow: '#00000099', // 99 = 60% opacity; x=0, y= 1, radius=4
    overlay: theme.color.bgComponent, // CC = 80% opacity
    shadow_icon: '#00000040', // 40 = 25% opacity; x=0, y=0, radius=4
    static_black: '#000000',
    static_white: '#ffffff',
    targetedMessageBackground: '#FBF4DD', // dark mode = #302D22
    transparent: 'transparent',
    white: theme.color.bg,
    white_smoke: 'red', //theme.color.bgTint,
    white_snow: theme.color.bg,
  },
  messageSimple: {
    content: {
      markdown: {
        text: {
          fontFamily: theme.fontFamily.medium
        },
      },
      metaText: {
        fontFamily: theme.fontFamily.medium
      }
    }
  },
  inlineDateSeparator: {
    container: {
      backgroundColor: 'transparent'
    },
    text: {
      fontFamily: theme.fontFamily.medium,
      color: theme.color.secondary,
    }
  },
  messageInput: {
    inputBox: {
      fontFamily: theme.fontFamily.medium
    }
  },
  dateHeader: {
    text: {
      color: theme.color.secondary,
      fontFamily: theme.fontFamily.medium
    },
    container: {
      backgroundColor: theme.color.bgComponent
    }
  },
  channelPreview: {
    title: {
      color: theme.color.text
    },
    container: {

    }
  }
};


export default function App() {
  const signIn = useAuthStore(state => state.signIn);
  const signOut = useAuthStore(state => state.signOut);
  const [fontsLoaded] = useFonts({
    'Avenir-Black': require('assets/fonts/Avenir-Black.ttf'),
    'Avenir-Heavy': require('assets/fonts/Avenir-Heavy.ttf'),
    'Avenir-Medium': require('assets/fonts/Avenir-Medium.ttf'),
    'DIN-Alternate-Bold': require('assets/fonts/DIN-Alternate-Bold.otf')
  });

  // toast config
  const toastConfig: ToastConfig = {
    error: ({ text1, text2 }) => (
      <View style={styles.toastContainer}>
        <MaterialCommunityIcons name={'alert-circle-outline'} color={theme.color.textBad} size={24} />
        <View style={styles.textContainer}>
          {text1 && <AppText size={'small'}>{text1}</AppText>}
          {text2 && <AppText size={'small'}>{text2}</AppText>}
        </View>
      </View>
    ),
    success: ({ text1, text2 }) => (
      <View style={styles.toastContainer}>
        <MaterialCommunityIcons name={'check-circle-outline'} color={theme.color.success} size={24} />
        <View style={styles.textContainer}>
          {text1 && <AppText size={'small'}>{text1}</AppText>}
          {text2 && <AppText size={'small'}>{text2}</AppText>}
        </View>
      </View>
    ),
  }

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);


  const checkSignedIn = async () => {
    const { data: { user } } = await supabase.auth.refreshSession();

    // if signed in, check if populated
    if(user) {
      const { data, error } = await supabase
        .from('users')
        .select('id, firstName, lastName, phoneNumber, email, dateOfBirth, streamChatToken')
        .single();
      if(error) {
        console.error('Error fetching user data');
        console.error(error);
      }

      if(data !== null && data.email !== null && data.firstName !== null && data.lastName !== null && data.dateOfBirth !== null) {
        signIn({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, dateOfBirth: data.dateOfBirth, phoneNumber: data.phoneNumber, streamChatToken: data.streamChatToken });
        return;
      }
    }

    // if we're here, the sign in flow failed and we should sign out.
    signOut();
  };

  useEffect(() => {
    checkSignedIn();
  }, []);


  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider
      style={{ backgroundColor: theme.color.bg }}
      onLayout={onLayoutRootView}
    >
      <UniversalStripeProvider publishableKey={'pk_live_IGqfybsjMLQbjecJ1XwI8zvM'}>
        <OverlayProvider value={{ style: chatTheme }}>
          <Chat client={streamChatClient}>
            <NavigationContainer theme={navTheme}>
              <StatusBar style="light" translucent={true} />
              <Root />
              <Toast config={toastConfig} topOffset={60} />
            </NavigationContainer>
          </Chat>
        </OverlayProvider>
      </UniversalStripeProvider>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  toastContainer: {
    minHeight: 60,
    alignSelf: 'stretch',
    marginHorizontal: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.color.bgComponent,
    flexDirection: 'row',
    gap: 20,
    borderRadius: theme.radius.standard,
    borderWidth: 1,
    borderColor: theme.color.bgBorder
  },
  textContainer: {
    flexGrow: 1,
    flexShrink: 1
  }
})