export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: "solar" | "water" | "trees" | "energy";
  duration: number; // minutes
  content: string;
  objectives: string[];
  quiz?: QuizQuestion[];
  voiceUrl?: string; // ElevenLabs placeholder
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface UserProgress {
  completedLessons: string[];
  badges: Badge[];
  streak: number;
  lastActiveDate: string;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
  type: "gold" | "silver" | "bronze";
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  points: number;
  badgeCount: number;
  completedLessons: number;
}
