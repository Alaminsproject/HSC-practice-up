export interface MCQ {
  id: string;
  question: string;
  options: string[];
  answer: number; // 0-3
  explanation?: string;
  subject: string;
  chapter: string;
  year?: string;
  type?: string;
  bookmarked?: boolean;
}

export interface UserStats {
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  lastActive: string; // ISO date
  subjectAccuracy: Record<string, number>;
  chapterAccuracy: Record<string, number>;
  examHistory: ExamResult[];
}

export interface ExamResult {
  id: string;
  date: string;
  subject: string;
  score: number;
  total: number;
  timeSpent: number; // seconds
  accuracy: number;
}

export type ViewState = 'splash' | 'home' | 'subjects' | 'chapters' | 'exam-setup' | 'practice' | 'result' | 'import' | 'stats' | 'bookmarks';
