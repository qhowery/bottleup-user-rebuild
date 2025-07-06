import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/globals";
import { Pressable, View, ViewProps } from "react-native";
import { useState } from "react";

export default function GradientOutlineButton(props: {
  onPress: () => void,
  gradient?: 'purple',
  background?: 'bg' | 'bgDark',
  borderWidth?: number,
  active?: boolean,
} & ViewProps) {
  const [fill, setFill] = useState(false);

  return <Pressable disabled={!(props.active ?? true)} onPress={props.onPress} onPressIn={() => setFill(true)} onPressOut={() => setFill(false)}>
    <LinearGradient
      colors={(props.active ?? true) ? [theme.color.indigo, theme.color.purplePink] : ['#14143e', '#322246']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...props}
      style={[{
        borderRadius: theme.radius.standard,
      }, props.style]}
    >
      <View style={{
        borderRadius: theme.radius.standard,
        margin: props.borderWidth !== undefined ? props.borderWidth : 1,
        backgroundColor: props.background === 'bgDark' ? theme.color.bgDark : theme.color.bg,
        opacity: fill ? 0 : 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        flexGrow: 1
      }} />
      <View style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: (props.active ?? true) ? 1 : 0.35
      }}>
        {props.children}
      </View>
    </LinearGradient>
  </Pressable>
}