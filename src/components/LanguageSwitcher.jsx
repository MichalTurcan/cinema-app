import React, { useContext } from 'react';
import { LanguageContext } from '../context/LenguageContext';

import "../style/LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);

  return (
    <div className="switch-button-group">
        <button
        onClick={() => toggleLanguage('sk')}
        className={`switch-button ${
          language === 'sk'
            ? 'switch-button-active'
            : 'switch-button-notactive'
        }`}
      >
        SK
      </button>
      <button
        onClick={() => toggleLanguage('en')}
        className={`switch-button ${
          language === 'en'
            ? 'switch-button-active'
            : 'switch-button-notactive'
        }`}
      >
        EN
      </button>
      
    </div>
  );
};

export default LanguageSwitcher;