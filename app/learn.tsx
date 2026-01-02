import { View, StyleSheet, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { apiCall } from "@/api/client";
import { useEffect, useState } from 'react';
import type { Brick } from '@/types/brick';
import type { StatusResponse } from '@/types/api';
import { brickAudioUrl } from '@/api/endpoints';
import PlaySoundButton from '@/components/PlaySoundButton';
import NextButton from '@/components/NextButton';
import CloseButton from '@/components/CloseButton';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Index() {
  const { collection_id } = useLocalSearchParams();
  const [brick, setBrick] = useState<Brick | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? {uri: audioUri} : null);
  const [showTarget, setShowTarget] = useState<boolean>(true);
  const [showNative, setShowNative] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const fetchRandomBrick = async () => {
    try {
      const br = await apiCall<Brick>(`/bricks/random/${collection_id}`);
      setBrick(br);
      setAudioUri(brickAudioUrl(br.target_audio_url));
      setAnswer("");
      setSimilarity(null);
    }
    catch (err) {
      console.error("Failed to fetch brick:", err);
    }
  };

  const playSound = () => {
    player.seekTo(0);
    player.play();
  };

  const showQuickMessage = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const reportBrokenFile = async () => {
    const response = await apiCall<StatusResponse>(`/bricks/report/${brick?.target_audio_url}`, {
      method: 'POST'
    });
    showQuickMessage(`${response.message}. Thank you!`);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setSubmitting(true);

    // fake similarity for now
    await new Promise(r => setTimeout(r, 400));
    setSimilarity(Math.random().toFixed(2) as unknown as number);

    setSubmitting(false);
  };

  useEffect(() => {
    fetchRandomBrick();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable style={styles.menuButton} onPress={() => setMenuOpen(!menuOpen)}>
        <SimpleLineIcons
          name={menuOpen ? "close" : "menu"}
          size={24}
          color="black"
        />
      </Pressable>

      {
        menuOpen &&
        <View style={styles.menu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              router.push({
                pathname: "/edit-brick",
                params: { brick_id: brick?.id },
              });
            }}
          >
            <Text>Edit brick</Text>
          </Pressable>
          

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              reportBrokenFile();
            }}
          >
            <Text>Report issue</Text>
          </Pressable>
        </View>
      }

      <CloseButton />
      {
        brick?
        <>
          <Pressable onPress={() => setShowTarget(!showTarget)}>
            <Text style={{ ...styles.text, color: "green"}}>{showTarget ? brick.target_text : "******"}</Text>
          </Pressable>
          <Pressable onPress={() => setShowNative(!showNative)}>
            <Text style={styles.text} >{showNative ? brick.native_text : "******"}</Text>
          </Pressable>
          <Text style={{ fontSize: 9, color: "#666" }}>{brick.target_audio_url}</Text>
        </>:
        <Text>Loadding...</Text>
      }

      <View style={styles.actionRow}>
        <PlaySoundButton onPress={playSound} />
        <NextButton onPress={fetchRandomBrick} />
      </View>

      {/* Result */}
      {similarity !== null && (
        <Text style={styles.resultText}>
          Similarity: {similarity}
        </Text>
      )}

      <View style={styles.answerRow}>
        {/* Mic icon */}
        <Pressable
          style={styles.micIcon}
          onPress={() => {
            showQuickMessage("Voice control coming soon.");
          }}
        >
          <FontAwesome name="microphone" size={28} color="green" />
        </Pressable>

        {/* Text input */}
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          placeholder="what did you hear?"
          style={styles.compactInput}
          editable={!submitting}
          returnKeyType="send"
          onSubmitEditing={submitAnswer}
        />

        {/* Submit icon */}
        <Pressable
          hitSlop={10}
          onPress={submitAnswer}
        >
          <FontAwesome name="paper-plane" size={24} color="green" />
        </Pressable>

      </View>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 20,
    textAlign: "center",
  },
  menuButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 8,
  },
  menu: {
    position: "absolute",
    top: 80,
    left: 20,
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 8,
    minWidth: 120,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  toast: {
    position: "absolute",
    bottom: 80,
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: {
    color: "white",
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  // 
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 20,
    width: "85%",
  },

  micIcon: {
    marginRight: 8,
  },

  compactInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },

  resultText: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
  },

});
