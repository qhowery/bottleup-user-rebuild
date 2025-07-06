import { Pressable, StyleSheet, View, ViewProps } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/globals";
import AppText from "@/components/AppText";

// todo - figure out how we want to handle text editing for this
export default function Counter(props: { value: number, setValue: (value: number | ((prev: number) => number)) => void, minCount: number, maxCount: number } & ViewProps) {
  // const [unsanitizedValue, setUnsanitizedValue] = useState('1');
  //
  // const handle = (s: string) => {
  //   setUnsanitizedValue(s);
  //   props.setValue(+s.replaceAll(/^[0-9]/g, ''));
  // }

  return <View {...props} style={[styles.container, props.style]}>
    <Pressable onPress={() => {
      if(props.value > props.minCount) {
        // setUnsanitizedValue(`${props.value-1}`);
        props.setValue(prev => prev - 1);
      }
    }} hitSlop={10}>
      <MaterialCommunityIcons name={'minus'} size={16} color={props.value === props.minCount ? 'transparent' : theme.color.secondary} />
    </Pressable>
    <AppText>{props.value}</AppText>
    <Pressable onPress={() => {
      if(props.value < props.maxCount) {
        props.setValue(prev => prev + 1)
      }
    }} hitSlop={10}>
      <MaterialCommunityIcons name={'plus'} size={16} color={props.value === props.maxCount ? 'transparent' : theme.color.secondary} />
    </Pressable>
  </View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  input: {
    height: 30,
    minWidth: 50
  }
})