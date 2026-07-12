export interface Exercise {
  id: number;
  name: string;
  is_completed?: boolean;
}

export interface Lesson {
  id: number;
  name: string;
  exercises: Exercise[];
  completed_exercises?: number;
  total_exercises?: number;
  progress_percent?: number;
}

export interface Topic {
  id: number;
  name: string;
  lessons: Lesson[];
  completed_exercises?: number;
  total_exercises?: number;
  progress_percent?: number;
}

export interface Question {
  question: string;
  question_id: number;
  answer: string[];
  correct_answer: string;
}

export type Screen =
  | { type: "topics" }
  | { type: "lessons"; topic: Topic }
  | { type: "exercises"; lesson: Lesson; topic: Topic }
  | { type: "quiz"; exercise: Exercise }
  | { type: "adaptive" };