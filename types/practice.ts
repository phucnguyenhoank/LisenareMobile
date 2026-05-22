export interface PracticeQuestion {
  id: number;
  question: string | null;
  content: string | null;
  answer: string | null;
  type: string | null;
  difficulty: number;
}

export interface StartPracticeRequest {
  learner_id: number;
  topic_ids: number[];
}

export interface StartPracticeResponse {
  session_id: string;
  theta: number;
  question: PracticeQuestion;
}

export interface AnswerPracticeRequest {
  session_id: string;
  learner_id: number;
  question_id: number;
  user_answer: string;
}

export interface AnswerPracticeResponse {
  is_correct: boolean;
  correct_answer: string | null;
  theta: number;
  practice_completed: boolean;
  next_question: PracticeQuestion | null;
}

export interface EndPracticeRequest {
  session_id: string;
  learner_id: number;
}

export const parsePracticeOptions = (q: PracticeQuestion): string[] => {
  if (!q.answer) return [];
  return q.answer
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
};

export const isPracticeMultiChoice = (q: PracticeQuestion): boolean => {
  if (q.type === "multiple_choice") return true;
  if (q.type === "fill" || q.type === "fill_in_blank") return false;
  return parsePracticeOptions(q).length > 1;
};
