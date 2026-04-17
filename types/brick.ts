// --- Enums ---

export enum UnitType {
  word = "word",
  phrase = "phrase",
  sentence = "sentence",
}

export enum SentenceStructure {
  simple = "simple",
  compound = "compound",
  complex = "complex",
  compound_complex = "compound_complex",
}

export enum SentenceFunction {
  declarative = "declarative",
  interrogative = "interrogative",
  imperative = "imperative",
  exclamatory = "exclamatory",
}

export enum GrammarPoint {
  // sentence-level
  present_simple = "present_simple",
  present_continuous = "present_continuous",
  present_perfect = "present_perfect",
  past_simple = "past_simple",
  past_continuous = "past_continuous",
  past_perfect = "past_perfect",
  future_will = "future_will",
  future_going_to = "future_going_to",
  future_present_continuous = "future_present_continuous",
  modal = "modal",
  passive = "passive",
  conditional = "conditional",
  relative_clause = "relative_clause",
  comparison = "comparison",
  negation = "negation",
  question_form = "question_form",
  reason_result = "reason_result",
  time_sequence = "time_sequence",

  // word-level
  noun = "noun",
  verb = "verb",
  adjective = "adjective",
  adverb = "adverb",
  preposition = "preposition",
  conjunction = "conjunction",
  pronoun = "pronoun",
  determiner = "determiner",

  // phrase-level
  noun_phrase = "noun_phrase",
  verb_phrase = "verb_phrase",
  adjective_phrase = "adjective_phrase",
  adverb_phrase = "adverb_phrase",
  prepositional_phrase = "prepositional_phrase",
}

// --- Metadata Types ---

export type BrickMetadataGrammarPoint = {
  id: number;
  grammar_point: GrammarPoint;
};

export type BrickMetadata = {
  id: number;
  unit_type: UnitType;
  structure: SentenceStructure | null;
  function: SentenceFunction | null;
  grammar_points: BrickMetadataGrammarPoint[] | null;
};

// --- Main Brick Type ---
export type Brick = {
  id: number;
  native_text: string;
  target_text: string;
  target_audio_path: string;
  cefr_level: string | null;
  is_public: boolean;
  creator_id: number;
  collection_id: number | null;
  brick_metadata_id: number;
  last_edit_at: string; // ISO Date String
  brick_metadata: BrickMetadata;
};

/** Simple version for lists/previews */
export type SimpleBrick = Pick<Brick, "id" | "target_text">;
