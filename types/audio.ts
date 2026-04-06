export type AudioTranscription = {
  transcript: string;
};

export interface PhonemeAnalysis {
  phoneme: string;
  status: "correct" | "mispronounced" | "missing" | "extra";
  heard?: string | null;
}

export interface PronunciationAnalysisResponse {
  accuracy_score: number;
  analysis: PhonemeAnalysis[];
  learner_phonemes: string[];
}
