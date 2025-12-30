import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <Link href="/learn" style={styles.text}>
      Start Learning
    </Link>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    textDecorationLine: "underline",
  }
});
