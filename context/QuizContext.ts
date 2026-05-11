// context/QuizContext.ts
import { createContext, useContext } from "react";
import { Exercise, Question } from "../types/grammar";

interface QuizContextType {
  exercise: Exercise;
  questions: Question[];
  answers: Record<number, { question_id: number; user_answer: string }>;
}

export const QuizContext = createContext<QuizContextType | null>(null);

export function useQuizContext() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuizContext must be used inside QuizScreen");
  return ctx;
}