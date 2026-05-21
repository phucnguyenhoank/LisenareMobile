import { request } from "@/services/client";
import { BrickMetadataSelector } from "@/components/brick-form/BrickMetadataSelector";
import { useTTSPlayer } from "@/hooks/useTTSPlayer";
import colors from "@/theme/colors";
import {
  GrammarPoint,
  SentenceFunction,
  SentenceStructure,
  UnitType,
} from "@/types/brick";
import { SentenceTranslateResponse } from "@/types/sentence";
import { cleanText } from "@/utils/brick-preprocessing";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleRequestError } from "@/utils/handle-request-error";

export default function AddBrickScreen() {
  const params = useLocalSearchParams<{
    native?: string;
    target?: string;
    audio_path?: string;
  }>();

  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    native: params.native || "",
    target: params.target || "",
    coll: "Daily Expressions",
    public: true,
  });

  // metadata
  const [metadata, setMetadata] = useState({
    unitType: UnitType.sentence,
    structure: null as SentenceStructure | null,
    func: null as SentenceFunction | null,
    selectedGrammarPoints: [] as GrammarPoint[],
  });

  const [loading, setLoading] = useState(false);
  const [isTargetTextUnique, setIsTargetTextUnique] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const [isReservedCollectionName, setIsReservedCollectionName] =
    useState(false);

  const [isCheckingCollectionName, setIsCheckingCollectionName] =
    useState(false);

  const [audioPath, setAudioPath] = useState<string | null>(
    params.audio_path ?? null,
  );
  const player = useAudioPlayer(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { isRecording } = useAudioRecorderState(recorder);

  const [ttsRequestText, setTtsRequestText] = useState<string | null>(null);
  const { audioUri: generatedAudioUri } = useTTSPlayer(ttsRequestText);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (audioPath) {
      player.replace({ uri: audioPath });
    }
  }, [audioPath, player]);

  useEffect(() => {
    console.log("generatedAudioUri:", generatedAudioUri);
    if (!generatedAudioUri) return;
    setAudioPath(generatedAudioUri);
  }, [generatedAudioUri]);

  useEffect(() => {
    if (!form.target.trim()) {
      setIsTargetTextUnique(true);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsChecking(true);

      try {
        const res = await request<{ exists: boolean }>(
          `/bricks/check-exists?target_text=${encodeURIComponent(form.target)}`,
        );

        setIsTargetTextUnique(!res.exists);
      } catch (err) {
        console.error(err);
        handleRequestError(err);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [form.target]);

  useEffect(() => {
    if (!form.coll.trim()) {
      setIsReservedCollectionName(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsCheckingCollectionName(true);

      try {
        const isReserved = await request<boolean>(
          `/collections/reserved-name?name=${encodeURIComponent(form.coll)}`,
        );

        setIsReservedCollectionName(isReserved);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingCollectionName(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [form.coll]);

  const setManualAudio = (uri: string) => {
    setAudioPath(uri);
    setTtsRequestText(null);
  };

  const toggleRecord = async () => {
    if (isRecording) {
      await recorder.stop();
      if (recorder.uri) {
        setManualAudio(recorder.uri);
      }
      return;
    }

    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow microphone access.");
      return;
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setManualAudio(asset.uri);
        Alert.alert("Success", `Selected: ${asset.name}`);
      }
    } catch (err) {
      Alert.alert("Error", "Could not select audio file.");
    }
  };

  const handlePlayAudio = () => {
    if (!audioPath) return;
    player.seekTo(0);
    player.play();
  };

  const onSubmit = async () => {
    if (!audioPath) {
      return Alert.alert("Missing audio", "Please add audio.");
    }

    if (!form.native || !form.target) {
      return Alert.alert(
        "Missing fields",
        "Please complete Vietnamese and English text.",
      );
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("audio_file", {
        uri: audioPath,
        name: "recording.m4a",
        type: "audio/m4a",
      } as any);

      const brickRequestData = {
        native_text: form.native,
        target_text: form.target,
        collection_name: form.coll,
        is_public: form.public,
        brick_metadata: {
          unit_type: metadata.unitType,
          structure: metadata.structure,
          function: metadata.func,
          grammar_points: metadata.selectedGrammarPoints.map((g) => ({
            grammar_point: g,
          })),
        },
      };

      // Have to use json_data key
      data.append("json_data", JSON.stringify(brickRequestData));

      await request("/bricks", {
        method: "POST",
        body: data,
      });

      Alert.alert(
        "Success",
        "Brick created successfully!",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => router.back(),
          },
          {
            text: "OK",
            onPress: () => {},
          },
        ],
        { cancelable: false },
      );
    } catch (err) {
      Alert.alert("Error", "Please check your connection.");
      console.log((err as any).data);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!form.native.trim()) return;

    try {
      setIsTranslating(true);

      const result = await request<SentenceTranslateResponse>(
        "/text/translations",
        {
          method: "POST",
          body: {
            text: form.native,
            target_lang: "en",
          },
        },
      );

      setForm((f) => ({
        ...f,
        target: result.text,
      }));
    } catch (err) {
      console.error("Auto translate failed:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Brick</Text>

          <View style={{ width: 28 }} />
        </View>

        {/* AUDIO SECTION */}
        <View style={styles.audioCard}>
          <View style={styles.audioTop}>
            <View>
              <Text style={styles.sectionTitle}>Audio</Text>
              <Text style={styles.sectionSubtitle}>
                Record or upload pronunciation
              </Text>
            </View>

            {audioPath && (
              <View style={styles.audioBadge}>
                <Feather name="check" size={14} color="#fff" />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={toggleRecord}
          >
            <FontAwesome5
              name={isRecording ? "stop" : "microphone"}
              size={22}
              color="#fff"
            />

            <Text style={styles.recordButtonText}>
              {isRecording ? "Stop Recording" : "Tap to Record"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickAudioFile}>
            <Feather name="upload" size={18} color={colors.secondary2} />
            <Text style={styles.uploadText}>Upload Audio File</Text>
          </TouchableOpacity>

          {audioPath && !isRecording && (
            <TouchableOpacity
              style={styles.previewButton}
              onPress={handlePlayAudio}
            >
              <Ionicons name={"play"} size={18} color={colors.secondary2} />
              <Text style={styles.previewText}>Preview Audio</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TRANSLATION SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Translation</Text>

          {/* Vietnamese */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>🇻🇳 Vietnamese</Text>

              {form.native.trim().length > 0 && (
                <TouchableOpacity
                  onPress={handleAutoTranslate}
                  disabled={isTranslating}
                >
                  <Text style={styles.autoTranslateText}>
                    {isTranslating ? "Translating..." : "✨ Auto translate"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Xin chào"
                value={form.native}
                onChangeText={(t) =>
                  setForm((f) => ({
                    ...f,
                    native: cleanText(t),
                  }))
                }
              />
            </View>
          </View>

          {/* English */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>🇺🇸 English</Text>

              {isChecking && (
                <ActivityIndicator size="small" color={colors.secondary2} />
              )}

              {form.target.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => setTtsRequestText(form.target)}
                  disabled={isTranslating}
                >
                  <Text style={styles.autoTranslateText}>🔊 Get audio</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Hello"
                value={form.target}
                onChangeText={(t) =>
                  setForm((f) => ({
                    ...f,
                    target: cleanText(t),
                  }))
                }
              />
            </View>

            {!isTargetTextUnique && (
              <Text style={styles.warningText}>
                Someone already created this.
              </Text>
            )}
          </View>
        </View>

        {/* ORGANIZATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization</Text>

          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Collection</Text>

              {isCheckingCollectionName && (
                <ActivityIndicator size="small" color={colors.secondary2} />
              )}
            </View>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.singleInput}
                value={form.coll}
                onChangeText={(t) =>
                  setForm((f) => ({
                    ...f,
                    coll: t,
                  }))
                }
              />
              {isReservedCollectionName && (
                <Text style={styles.warningText}>
                  This collection name is reserved.
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* VISIBILITY */}
        <View style={styles.switchCard}>
          <View>
            <Text style={styles.switchTitle}>Public Brick</Text>

            <Text style={styles.switchSubtitle}>
              Other learners can discover this sentence
            </Text>
          </View>

          <Switch
            value={form.public}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                public: v,
              }))
            }
            trackColor={{
              true: colors.secondary2,
            }}
          />
        </View>

        {/* METADATA */}
        <View style={styles.metadataSection}>
          <BrickMetadataSelector
            state={metadata}
            onChange={(patch) =>
              setMetadata((prev) => ({
                ...prev,
                ...patch,
              }))
            }
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading ||
              isRecording ||
              !isTargetTextUnique ||
              isReservedCollectionName ||
              !audioPath) && {
              opacity: 0.5,
            },
          ]}
          disabled={
            loading ||
            isRecording ||
            !isTargetTextUnique ||
            isReservedCollectionName ||
            !audioPath
          }
          onPress={onSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>Create Brick</Text>
            </>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <KeyboardToolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },

  container: {
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
  },

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginBottom: 18,
  },

  sectionSubtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
  },

  // AUDIO

  audioCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    elevation: 1,
  },

  audioTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  audioBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },

  recordButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.secondary2,
    marginTop: 24,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  recordButtonActive: {
    backgroundColor: "#EF4444",
  },

  recordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  uploadButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  uploadText: {
    color: colors.secondary2,
    fontWeight: "600",
  },

  previewButton: {
    marginTop: 16,
    backgroundColor: colors.buttonBackground,
    borderRadius: 14,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  previewText: {
    color: colors.secondary2,
    fontWeight: "700",
  },

  // FIELDS

  fieldWrapper: {
    marginBottom: 22,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
    marginBottom: 10,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  input: {
    fontSize: 16,
    color: "#222",
    textAlignVertical: "top",
    lineHeight: 24,
  },

  singleInput: {
    fontSize: 16,
    color: "#222",
  },

  warningText: {
    marginTop: 8,
    marginLeft: 4,
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },

  autoTranslateText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.secondary2,
    fontWeight: "500",
  },

  // SWITCH

  switchCard: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,

    borderWidth: 1,
    borderColor: "#ECECEC",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  switchSubtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
    maxWidth: 240,
  },

  // METADATA

  metadataSection: {
    marginTop: 30,
  },

  // SUBMIT

  submitButton: {
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.secondary2,

    marginTop: 36,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,

    shadowColor: colors.secondary2,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 6,
  },

  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});
