import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import colors from '@/theme/colors';

export default function CloseButton() {
  return (
    <Pressable style={styles.closeButton} onPress={() => router.back()}>
      <MaterialIcons name="close" size={32} color={colors.primary} />
    </Pressable>
  );
}


const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 40,
    right: 16,
  },
});
