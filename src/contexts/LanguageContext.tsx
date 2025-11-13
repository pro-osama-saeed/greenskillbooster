import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, detectBrowserLanguage, LANGUAGES } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("app-language");
    if (saved && saved in LANGUAGES) {
      return saved as Language;
    }
    
    // Auto-detect from browser
    return detectBrowserLanguage();
  });

  const isRTL = 'rtl' in LANGUAGES[language] && LANGUAGES[language].rtl === true;

  // Apply RTL direction to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  // Save to localStorage and Supabase when language changes
  useEffect(() => {
    localStorage.setItem("app-language", language);
    
    // Save to user profile if logged in
    if (user) {
      supabase
        .from('profiles')
        .update({ 
          // We'll need to add a language column to profiles table
          // For now, store in raw_user_meta_data would require auth schema access
        })
        .eq('id', user.id);
    }
  }, [language, user]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL }}>
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
