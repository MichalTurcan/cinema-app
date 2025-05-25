import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
      
      return localStorage.getItem('language') || 'sk';
    });
  
    const toggleLanguage = (lang) => {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};