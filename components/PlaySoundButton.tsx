import { View, Pressable, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type Props = {
  onPress: () => void;
};

export default function PlaySoundButton({ onPress }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.circle} onPress={onPress}>
        <AntDesign name="sound" size={20} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 8,
  },
  circle: {
    height: 44,
    width: 44,
    borderRadius: 22, 
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
});
