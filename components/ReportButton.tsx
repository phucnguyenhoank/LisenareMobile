import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = {
  onPress: () => void;
};

export default function ReportButton({ onPress }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.circle} onPress={onPress}>
        <MaterialIcons name="bug-report" size={24} color="red" />
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
    borderWidth: 2,
    borderColor: "red",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonLabel: {
    color: '#fff',
    fontSize: 12
  },

});
