import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CloseButton from '@/components/CloseButton';

export default function HowToLearn() {
  // Access precise inset values (top, bottom, left, right)
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.mainContainer, { backgroundColor: '#fff' }]}>
      {/* Fixed Header with dynamic top padding based on the device notch/status bar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <CloseButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          How to Learn Any Language
        </Text>

        <Text style={styles.paragraph}>
          Please read this carefully before you start. This guide explains how
          to learn a language effectively using this app.
        </Text>

        <Text style={styles.paragraph}>
          We assume that you already know Vietnamese (your native language) and
          want to learn English (your target language).
        </Text>

        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <Text style={styles.paragraph}>
          There are only <Text style={styles.bold}>two main steps</Text>.
          Simple, clear, and practical.
        </Text>

        {/* STEP 1 */}
        <Text style={styles.sectionTitle}>
          Step 1: Prepare Your Learning Resources (Bricks)
        </Text>

        <Text style={styles.paragraph}>
          A <Text style={styles.bold}>Brick</Text> consists of three things:
        </Text>

        <Text style={styles.listItem}>
          • A sentence in your native language
        </Text>
        <Text style={styles.listItem}>
          • Its translation in the target language
        </Text>
        <Text style={styles.listItem}>
          • Audio in the target language
        </Text>

        <Text style={styles.paragraph}>
          Think of Bricks like real bricks used to build a house. Each brick
          helps strengthen your language ability.
        </Text>

        <Text style={styles.note}>
          Note: Examples and audio will be shown here.
        </Text>

        <Text style={styles.paragraph}>
          You can create Bricks yourself, but Lisenare and our community already
          provide many common Bricks for you.
        </Text>

        {/* STEP 2 */}
        <Text style={styles.sectionTitle}>
          Step 2: Start Learning
        </Text>

        <Text style={styles.paragraph}>
          Pick one Brick, listen to the audio, and speak. There are three levels:
        </Text>

        <Text style={styles.listItem}>
          • Level 1: Speak while listening to the audio
        </Text>
        <Text style={styles.listItem}>
          • Level 2: Speak after listening to the audio
        </Text>
        <Text style={styles.listItem}>
          • Level 3: Speak after a long pause
        </Text>

        <Text style={styles.paragraph}>
          You may use the translation as support, but the key idea is to
          <Text style={styles.bold}> use your target language as much as possible</Text>.
        </Text>

        <Text style={styles.paragraph}>
          You can also write if you want—writing works the same way as speaking.
        </Text>

        {/* FINAL */}
        <Text style={styles.sectionTitle}>
          Final Advice
        </Text>

        <Text style={styles.paragraph}>
          If you practice consistently, you will see improvement. Language
          learning does not happen suddenly—it is built through daily habits.
        </Text>

        <Text style={styles.paragraph}>
          Click here to practice what you just learned in action.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10, // Keeps the close button interactive and on top
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    marginLeft: 12,
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 10,
  },
});
