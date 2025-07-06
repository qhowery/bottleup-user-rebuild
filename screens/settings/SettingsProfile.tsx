import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { useAuthStore } from "@/globals";
import RequiredAuthAlert from "@/components/RequiredAuthAlert";
import UserDetails from "@/screens/auth/UserDetails";


export default function SettingsProfile() {
  const navigation = useNavigation<any>();
  const signedIn = useAuthStore(state => state.signedIn);


  // handler
  const handleBackButton = useCallback(() => {
    navigation.goBack();
  }, []);


  // ensure that user is signed in
  if(!signedIn) {
    return <AppSafeAreaView>
      <Header title={'Profile'} leftButtonHandler={handleBackButton} leftButton={'chevron-left'} />
      <RequiredAuthAlert titleText={'Sign in to edit your profile details.'} icon={'badge-account-outline'} />
    </AppSafeAreaView>
  }

  return <UserDetails variant={'edit'} />
}