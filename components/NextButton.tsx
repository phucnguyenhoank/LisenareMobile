import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = {
  onPress: () => void;
};

export default function Button({ onPress }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={onPress}>
        <MaterialIcons name="navigate-next" size={24} color="white" />
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  buttonContainer: {
    margin: 8,
  },

  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
  },

});
