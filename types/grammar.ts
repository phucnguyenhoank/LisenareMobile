export interface Exercise {
  id: number;
  name: string;
}

export interface Lesson {
  id: number;
  name: string;
  exercises: Exercise[];
}

export interface Topic {
  id: number;
  name: string;
  lessons: Lesson[];
}

export interface Question {
  question: string;
  answer: string[];
  correct_answer: string;
}

export type Screen =
  | { type: "topics" }
  | { type: "lessons"; topic: Topic }
  | { type: "exercises"; lesson: Lesson; topic: Topic }
  | { type: "quiz"; exercise: Exercise };