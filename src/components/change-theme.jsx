import "../style/index.css";
import { useState, useEffect } from "react";

function ChangeTheme() {
    const [lightMode, setLightMode] = useState(() => {
        return localStorage.getItem("lightMode") === "true";
      });
    
      useEffect(() => {
        document.body.classList.toggle("light-mode", lightMode);
        localStorage.setItem("lightMode", lightMode);
      }, [lightMode]);
    
      return (
        <button type="button" class="btn" id="btn-change-theme" onClick={() => setLightMode(!lightMode)}>
          {lightMode ? <i class="bi bi-moon-fill"></i> : <i class="bi bi-brightness-high-fill"></i>} 
        </button>
      );

  }
  
  export default ChangeTheme;