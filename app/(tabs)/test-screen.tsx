import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { useEffect, useState } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
} from 'expo-audio';

import { apiCall } from '@/api/client';
import type { AudioTranscription } from '@/types/audio';


export default function TestScreen() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const player = useAudioPlayer();
  const [transcription, setTranscription] = useState<string | null>(null);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
  };

  const transcribeAudio = async () => {
    console.log(`audioRecorder.uri:${audioRecorder.uri}`);
    const formData = new FormData();
    formData.append('file', {
      uri: audioRecorder.uri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const { transcript } = await apiCall<AudioTranscription>('/audio/transcribe', {
          method: 'POST',
          body: formData,
        });

        setTranscription(transcript);
        return;
      } catch {
        if (attempt < 5) await new Promise(r => setTimeout(r, 400));
      }
    }
    setTranscription('try again');
  }

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
    <View>
      <Button 
        title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={recorderState.isRecording ? stopRecording : record}
      />

      <Button 
        title={'Play'}
        onPress={() => {
          player.replace(audioRecorder.uri);
          player.seekTo(0);
          player.play();
        }}
      />

      <Button title='transcribe' onPress={transcribeAudio} />
      {transcription ? (
        <Text>{transcription}</Text>
      ) : (
        <Text>No transcription yet.</Text>
      )}

    </View>
  );
}
