import { QuizQuestion, DragDropActivity, ChecklistActivity } from "@/types/lesson";

/**
 * Fisher-Yates shuffle algorithm for randomizing array elements
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffles quiz questions and their answer options while maintaining correct answer tracking
 */
export function shuffleQuizQuestions(quiz: QuizQuestion[]): QuizQuestion[] {
  // First shuffle the questions
  const shuffledQuestions = shuffleArray(quiz);
  
  // Then shuffle options within each question
  return shuffledQuestions.map(question => {
    const optionsWithIndex = question.options.map((option, index) => ({
      option,
      wasCorrect: index === question.correctAnswer
    }));
    
    const shuffledOptions = shuffleArray(optionsWithIndex);
    
    return {
      ...question,
      options: shuffledOptions.map(item => item.option),
      correctAnswer: shuffledOptions.findIndex(item => item.wasCorrect)
    };
  });
}

/**
 * Shuffles drag-drop activity items
 */
export function shuffleDragDropItems(activity: DragDropActivity): DragDropActivity {
  return {
    ...activity,
    items: shuffleArray(activity.items)
  };
}

/**
 * Shuffles checklist activity items
 */
export function shuffleChecklistItems(activity: ChecklistActivity): ChecklistActivity {
  return {
    ...activity,
    items: shuffleArray(activity.items)
  };
}
