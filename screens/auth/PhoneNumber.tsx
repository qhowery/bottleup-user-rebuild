import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import Header from "@/components/Header";
import { useNavigation } from "@react-navigation/native";
import AppText from "@/components/AppText";
import AppTextInputFormatted from "@/components/AppTextInputFormatted";
import { useAuthFlowStore } from "@/globals";
import { useCallback, useState } from "react";
import GradientButton from "@/components/GradientButton";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import { parsePhoneNumber } from "libphonenumber-js";

export default function PhoneNumber() {
  const navigation = useNavigation<any>();
  const [inputPhoneNumber, setInputPhoneNumber] = useState<string>('');
  const phoneNumber = useAuthFlowStore(state => state.phoneNumber);
  const setPhoneNumber = useAuthFlowStore(state => state.setPhoneNumber);
  const [phoneNumberValid, setPhoneNumberValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const handlePhoneNumber = useCallback((s: string) => {
    // format into raw phone number
    s = s.replaceAll(/[^0-9]/g, ''); // remove non-numeric
    s = s.substring(1); // remove leading 1 from country code

    // validate phone number, and set ephermeralPhoneNumber if it *is* valid.
    try {
      const phoneNumber = parsePhoneNumber(s, 'US');
      if(phoneNumber && phoneNumber.isValid()) {
        setInputPhoneNumber(phoneNumber.format('E.164'));
        setPhoneNumberValid(true);
      }
      else {
        setPhoneNumberValid(false);
      }
    }
    catch {
      setPhoneNumberValid(false);
    }

    // reset error message due to new input
    setErrorMessage('');

    // start with country code with emoji flag
    let out = '🇺🇸 +1 ';

    // write area code
    if(s.length >= 1) {
      out += `(${s.substring(0, 3)}`
    }

    // middle 3 digits
    if(s.length >= 4) {
      out += ') ' + s.substring(3, 6);
    }

    // write last 4 digits
    if(s.length >= 7) {
      out += '-' + s.substring(6);
    }

    return out;
  }, []);


  // handleSubmitKeyboard displays an error message, while handleSubmitButton acts as though the press didn't even happen
  const submit = useCallback(() => {
    setPhoneNumber(inputPhoneNumber);
    navigation.navigate('VerifyPhoneNumber')
  }, [phoneNumber, inputPhoneNumber]);

  const handleSubmitKeyboard = useCallback(() => {
    if(phoneNumberValid) {
      submit();
    }
    else {
      setErrorMessage(`The phone number isn't valid.`)
    }
  }, [phoneNumberValid]);

  const handleSubmitButton = useCallback(() => {
    if(phoneNumberValid) {
      submit();
    }
  }, [phoneNumberValid]);


  return <AppSafeAreaView>
    <Header title={''} leftButton={'chevron-left'} leftButtonHandler={() => navigation.goBack()} />
    <View style={styles.container}>
      <AppText size={'large'} font={'black'}>What's your number?</AppText>
      <AppText size={'small'} color={'secondary'} style={styles.subtitle}>We'll text a code to verify your phone.</AppText>
      <AppTextInputFormatted
        maxLength={32}
        handleRaw={handlePhoneNumber}
        handleSubmit={handleSubmitKeyboard}
        inputProps={{ keyboardType: 'phone-pad' }}
        errorMessage={errorMessage}
      />
    </View>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.aboveKeyboard}
    >
      <GradientButton style={styles.button} active={phoneNumberValid} onPress={handleSubmitButton}>
        <AppText font={'heavy'}>Next</AppText>
      </GradientButton>
    </KeyboardAvoidingView>
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  subtitle: {
    marginBottom: 20
  },
  button: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 18
  },
  aboveKeyboard: {
    flexGrow: 1,
    justifyContent: 'flex-end'
  }
});