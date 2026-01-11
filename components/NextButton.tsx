import { View, Text, Pressable, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import colors from '@/theme/colors';

type Props = {
  onPress: () => void;
};

export default function NextButton({ onPress }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}>
        <Feather name="arrow-right" size={28} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 8,
  },

  button: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

});
