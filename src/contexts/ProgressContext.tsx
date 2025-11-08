import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProgress, Badge } from "@/types/lesson";

interface ProgressContextType {
  progress: UserProgress;
  completeLesson: (lessonId: string) => void;
  addBadge: (badge: Badge) => void;
  updateStreak: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const initialProgress: UserProgress = {
  completedLessons: [],
  badges: [],
  streak: 0,
  lastActiveDate: new Date().toISOString(),
  points: 0,
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("greenskill-progress");
    return saved ? JSON.parse(saved) : initialProgress;
  });

  useEffect(() => {
    localStorage.setItem("greenskill-progress", JSON.stringify(progress));
  }, [progress]);

  const completeLesson = (lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      
      const newPoints = prev.points + 100;
      const newCompleted = [...prev.completedLessons, lessonId];
      
      // Auto-award badges based on milestones
      const newBadges = [...prev.badges];
      
      if (newCompleted.length === 1 && !newBadges.some(b => b.id === "first-lesson")) {
        newBadges.push({
          id: "first-lesson",
          name: "First Steps",
          description: "Completed your first lesson",
          icon: "🌱",
          earnedDate: new Date().toISOString(),
          type: "bronze",
        });
      }
      
      if (newCompleted.length === 3 && !newBadges.some(b => b.id === "three-lessons")) {
        newBadges.push({
          id: "three-lessons",
          name: "Getting Started",
          description: "Completed 3 lessons",
          icon: "🌿",
          earnedDate: new Date().toISOString(),
          type: "silver",
        });
      }
      
      if (newCompleted.length === 6 && !newBadges.some(b => b.id === "master")) {
        newBadges.push({
          id: "master",
          name: "Climate Champion",
          description: "Completed all core lessons",
          icon: "🏆",
          earnedDate: new Date().toISOString(),
          type: "gold",
        });
      }
      
      return {
        ...prev,
        completedLessons: newCompleted,
        badges: newBadges,
        points: newPoints,
      };
    });
  };

  const addBadge = (badge: Badge) => {
    setProgress((prev) => ({
      ...prev,
      badges: [...prev.badges, badge],
    }));
  };

  const updateStreak = () => {
    setProgress((prev) => {
      const today = new Date().toDateString();
      const lastActive = new Date(prev.lastActiveDate).toDateString();
      
      if (today === lastActive) return prev;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = yesterday.toDateString() === lastActive;
      
      return {
        ...prev,
        streak: wasYesterday ? prev.streak + 1 : 1,
        lastActiveDate: new Date().toISOString(),
      };
    });
  };

  return (
    <ProgressContext.Provider value={{ progress, completeLesson, addBadge, updateStreak }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return context;
};
