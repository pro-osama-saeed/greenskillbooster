import React, { createContext, useContext, useState } from "react";

type Language = "en" | "es" | "fr" | "sw" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: "GreenSkill Booster",
    tagline: "Learn Climate Skills, Build a Better Future",
    startLearning: "Start Learning",
    lessons: "Lessons",
    badges: "Badges",
    leaderboard: "Leaderboard",
    about: "About",
    resources: "Resources",
    progress: "Your Progress",
    completedLessons: "Completed Lessons",
    earnedBadges: "Earned Badges",
    currentStreak: "Day Streak",
    minutes: "minutes",
    startLesson: "Start Lesson",
    completeLesson: "Complete Lesson",
    playVoice: "Play Voice",
    learningObjectives: "Learning Objectives",
    quiz: "Quiz",
    nextQuestion: "Next Question",
    finish: "Finish Quiz",
    congratulations: "Congratulations!",
    viewCertificate: "View Certificate",
    downloadCertificate: "Download Certificate",
    topLearners: "Top Learners",
    points: "points",
  },
  es: {
    appName: "Impulsor de Habilidades Verdes",
    tagline: "Aprende Habilidades Climáticas, Construye un Futuro Mejor",
    startLearning: "Comenzar a Aprender",
    lessons: "Lecciones",
    badges: "Insignias",
    leaderboard: "Tabla de Clasificación",
    about: "Acerca de",
    resources: "Recursos",
    progress: "Tu Progreso",
    completedLessons: "Lecciones Completadas",
    earnedBadges: "Insignias Ganadas",
    currentStreak: "Días de Racha",
    minutes: "minutos",
    startLesson: "Comenzar Lección",
    completeLesson: "Completar Lección",
    playVoice: "Reproducir Voz",
    learningObjectives: "Objetivos de Aprendizaje",
    quiz: "Cuestionario",
    nextQuestion: "Siguiente Pregunta",
    finish: "Finalizar Cuestionario",
    congratulations: "¡Felicitaciones!",
    viewCertificate: "Ver Certificado",
    downloadCertificate: "Descargar Certificado",
    topLearners: "Mejores Estudiantes",
    points: "puntos",
  },
  fr: {
    appName: "Booster de Compétences Vertes",
    tagline: "Apprenez les Compétences Climatiques, Construisez un Avenir Meilleur",
    startLearning: "Commencer à Apprendre",
    lessons: "Leçons",
    badges: "Badges",
    leaderboard: "Classement",
    about: "À Propos",
    resources: "Ressources",
    progress: "Votre Progrès",
    completedLessons: "Leçons Terminées",
    earnedBadges: "Badges Gagnés",
    currentStreak: "Jours de Série",
    minutes: "minutes",
    startLesson: "Commencer la Leçon",
    completeLesson: "Terminer la Leçon",
    playVoice: "Jouer la Voix",
    learningObjectives: "Objectifs d'Apprentissage",
    quiz: "Quiz",
    nextQuestion: "Question Suivante",
    finish: "Terminer le Quiz",
    congratulations: "Félicitations!",
    viewCertificate: "Voir le Certificat",
    downloadCertificate: "Télécharger le Certificat",
    topLearners: "Meilleurs Apprenants",
    points: "points",
  },
  sw: {
    appName: "Kiboresha Ujuzi wa Kijani",
    tagline: "Jifunze Ujuzi wa Tabianchi, Jenga Mustakabali Bora",
    startLearning: "Anza Kujifunza",
    lessons: "Masomo",
    badges: "Beji",
    leaderboard: "Orodha ya Viongozi",
    about: "Kuhusu",
    resources: "Rasilimali",
    progress: "Maendeleo Yako",
    completedLessons: "Masomo Yaliyokamilika",
    earnedBadges: "Beji Zilizopata",
    currentStreak: "Mfululizo wa Siku",
    minutes: "dakika",
    startLesson: "Anza Somo",
    completeLesson: "Kamilisha Somo",
    playVoice: "Cheza Sauti",
    learningObjectives: "Malengo ya Kujifunza",
    quiz: "Jaribio",
    nextQuestion: "Swali Linalofuata",
    finish: "Maliza Jaribio",
    congratulations: "Hongera!",
    viewCertificate: "Angalia Cheti",
    downloadCertificate: "Pakua Cheti",
    topLearners: "Wanafunzi Bora",
    points: "alama",
  },
  hi: {
    appName: "ग्रीन स्किल बूस्टर",
    tagline: "जलवायु कौशल सीखें, बेहतर भविष्य बनाएं",
    startLearning: "सीखना शुरू करें",
    lessons: "पाठ",
    badges: "बैज",
    leaderboard: "लीडरबोर्ड",
    about: "के बारे में",
    resources: "संसाधन",
    progress: "आपकी प्रगति",
    completedLessons: "पूर्ण पाठ",
    earnedBadges: "अर्जित बैज",
    currentStreak: "दिन की लकीर",
    minutes: "मिनट",
    startLesson: "पाठ शुरू करें",
    completeLesson: "पाठ पूरा करें",
    playVoice: "आवाज़ चलाएं",
    learningObjectives: "सीखने के उद्देश्य",
    quiz: "प्रश्नोत्तरी",
    nextQuestion: "अगला प्रश्न",
    finish: "प्रश्नोत्तरी समाप्त करें",
    congratulations: "बधाई हो!",
    viewCertificate: "प्रमाणपत्र देखें",
    downloadCertificate: "प्रमाणपत्र डाउनलोड करें",
    topLearners: "शीर्ष शिक्षार्थी",
    points: "अंक",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
