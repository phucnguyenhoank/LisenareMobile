import { Ionicons } from '@expo/vector-icons'; // Standard in Expo
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function ChatTopic() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.listItem,
        pressed && styles.pressed // Visual feedback when tapped
      ]}
      onPress={() => router.push("/chat")}
    >
      <Text style={styles.topicText}>How was your day?</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Light separator line
  },
  topicText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pressed: {
    backgroundColor: '#f9f9f9', // Slight gray tint on tap
  },
});
