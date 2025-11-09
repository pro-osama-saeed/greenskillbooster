export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: "solar" | "water" | "trees" | "energy" | "waste" | "community" | "communication";
  duration: number; // minutes
  content: string;
  objectives: string[];
  quiz?: QuizQuestion[];
  dragDropActivity?: DragDropActivity;
  checklistActivity?: ChecklistActivity;
  didYouKnow?: string;
  voiceUrl?: string; // ElevenLabs placeholder
}

export interface DragDropActivity {
  id: string;
  title: string;
  instruction: string;
  items: DragDropItem[];
  categories: DragDropCategory[];
}

export interface DragDropItem {
  id: string;
  text: string;
  correctCategory: string;
}

export interface DragDropCategory {
  id: string;
  title: string;
}

export interface ChecklistActivity {
  id: string;
  title: string;
  instruction: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  tip?: string;
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
