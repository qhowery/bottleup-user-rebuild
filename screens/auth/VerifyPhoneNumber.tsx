import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { endpoints, supabase, useAuthFlowStore, useAuthStore } from "@/globals";
import { StackActions, useNavigation } from "@react-navigation/native";
import AppText from "@/components/AppText";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import AppTextInputFormatted from "@/components/AppTextInputFormatted";
import GradientButton from "@/components/GradientButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parsePhoneNumber } from "libphonenumber-js";
import Toast from "react-native-toast-message";

export default function VerifyPhoneNumber() {
  const signIn = useAuthStore(state => state.signIn);
  const phoneNumber = useAuthFlowStore(state => state.phoneNumber);
  const phoneNumberObject = useMemo(() => parsePhoneNumber(phoneNumber ?? '+19999999999'), [phoneNumber]);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation<any>();
  const [codeIsLongEnough, setCodeIsLongEnough] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);


  // send phone number verification
  const sendCode = async () => {
    const res = await fetch(endpoints.auth.initPhoneVerification, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber
      })
    });

    if(res.status !== 200) {
      setErrorMessage('Failed to send code. Please try again later.');
      return;
    }
  };

  // send code on page load
  useEffect(() => {
    sendCode();
  }, []);


  // handle text input of code
  const handleCodeInput = useCallback((s: string) => {
    s = s.replaceAll(/[^0-9]/g, ''); // remove non-numeric
    setCodeIsLongEnough(s.length >= 5);
    setErrorMessage('');
    setCode(s);
    return s;
  }, []);


  // verify code
  const verifyCode = async () => {
    if(isProcessing) {
      return;
    }
    console.log("ENTERED");
    setIsProcessing(true);

    const res = await fetch(endpoints.auth.createSession, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        code: code
      })
    });

    const text = await res.text();
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
    if(res.status === 400 && text === 'Wrong code') {
      Toast.show({
        type: 'error',
        text1: 'Incorrect code.'
      });
    }
    else if(res.status !== 200) {
      console.error(text);
      Toast.show({
        type: 'error',
        text1: 'Failed to verify code. Please try again later.'
      });
    }

    // success! set session and refresh tokens
    else {
      const data: { password: string, needsPopulation: boolean } = JSON.parse(text);

      // sign in with supabase
      const { error: userError } = await supabase.auth.signInWithPassword({ email: `${phoneNumber}@dummy.null`, password: data.password });
      if(userError) {
        console.error(userError);
        Toast.show({
          type: 'error',
          text1: 'Failed to sign in user.'
        });
        return;
      }

      // populate, if necessary
      if(!data.needsPopulation) {
        // if user was already populated, we still need to fetch these details to sign in client-side
        const { data, error } = await supabase
          .from('users')
          .select('id, firstName, lastName, phoneNumber, email, dateOfBirth, streamChatToken')
          .single();
        if(error) {
          console.error(error);
          Toast.show({
            type: 'error',
            text1: 'Failed to fetch user data.'
          });
          return;
        }

        if(data !== null && data.email !== null && data.firstName !== null && data.lastName !== null && data.dateOfBirth !== null) {
          signIn({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, dateOfBirth: data.dateOfBirth, phoneNumber: data.phoneNumber, streamChatToken: data.streamChatToken });
          const leaveAuthStack = StackActions.pop(2);
          navigation.dispatch(leaveAuthStack);
          return;
        }
      }

      // if we got here, that means that the user needs population
      navigation.navigate('UserDetails');
    }
  };

  const handleSubmitKeyboard = useCallback(() => {
    if(isProcessing) {
      return;
    }

    if(codeIsLongEnough) {
      verifyCode();
    }
    else {
      setErrorMessage('The code is too short.');
    }
  }, [codeIsLongEnough, isProcessing]);

  const handleSubmitButton = useCallback(() => {
    if(codeIsLongEnough && !isProcessing) {
      verifyCode();
    }
  }, [codeIsLongEnough, isProcessing]);


  if(phoneNumber === null) {
    console.error('VerifyPhoneNumber was reached without setting phoneNumber to a valid value.');
    navigation.navigate('HomeLayout');
    return null;
  }


  return <AppSafeAreaView>
    <Header title={''} leftButton={'chevron-left'} leftButtonHandler={() => navigation.goBack()} />
    <View style={styles.container}>
      <AppText size={'large'} font={'black'}>Enter the verification code.</AppText>
      <AppText size={'small'} color={'secondary'} style={styles.subtitle}>Sent to {phoneNumberObject.formatNational()}.</AppText>
      <AppTextInputFormatted
        maxLength={6}
        handleRaw={handleCodeInput}
        errorMessage={errorMessage}
        handleSubmit={handleSubmitKeyboard}
        inputProps={{ keyboardType: 'number-pad' }}
      />
      <Pressable style={styles.resend} onPress={sendCode} hitSlop={13}>
        <AppText size={'small'} color={'secondary'}>
          Code not showing up? Try
          {' '}<AppText size={'small'} color={'primary'}>sending a new code</AppText>
          .
        </AppText>
      </Pressable>
    </View>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.aboveKeyboard}
    >
      <GradientButton style={styles.button} active={codeIsLongEnough && !isProcessing} onPress={handleSubmitButton}>
        <AppText font={'heavy'}>Verify</AppText>
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
  resend: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-end'
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