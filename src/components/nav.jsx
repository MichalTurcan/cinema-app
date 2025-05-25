import { Link } from "react-router-dom";
import AnchorLink from "react-anchor-link-smooth-scroll";
import { useState } from "react";
import { useLocation } from 'react-router-dom';
import { useEffect } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import "../style/header.css";
import LanguageSwitcher from "./LanguageSwitcher";
import LoginSignupModal from './Login';
import "../style/login.css";

import {useAuth} from "../context/AuthContext";

import { useContext } from 'react';
import { LanguageContext } from '../context/LenguageContext';

const ScrollToHashElement = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  return null;
};


function Nav() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const { language } = useContext(LanguageContext);

  const [scrolled, setScrolled] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login');

  const { user, logout } = useAuth();


  const handleLogout = () => {
    logout(); 
};

  
  const openLoginModal = () => {
    setModalMode('login');
    setIsModalOpen(true);
  };
  
  const openSignupModal = () => {
    setModalMode('signup');
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('')
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const content = {
    en: {
      aboutUs: 'About Us',
      vote: 'Vote',
      team: 'team',
      events: 'events',
      contact: 'contact',
      login: 'LogIn',
      signup: 'SignUp'


    },
    sk: {
      aboutUs: 'O nás',
      vote: 'Hlasovanie',
      team: 'tím',
      events: 'udalosti',
      contact: 'kontakt',
      login: 'Prihlásenie',
      signup: 'Registrácia'
    }
  };
  return (
    <>
      <ScrollToHashElement />
      <nav className={`navbar fixed-top navbar-expand-lg ${scrolled ? "scrolled" : ""}`}>
        <div className="container-fluid d-flex align-items-center">

        {isHomePage ? (
          <AnchorLink className="navbar-brand me-3" href="#header"><img src="/img/Logo_Horizontal_Light.svg" alt="Logo" className="logo" /></AnchorLink>
        ) : (
          <Link className="navbar-brand me-3" to="/#header">
            <img src="/img/Logo_Horizontal_Light.svg" alt="Logo" className="logo" />
          </Link>
        )}

          <button
            className="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>


          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <ul className="navbar-nav me-auto d-flex flex-column flex-lg-row align-items-lg-center">
              <li className="nav-item">
                {isHomePage ? (
                  <AnchorLink className="nav-link" href="#about">{content[language].aboutUs}</AnchorLink>
                ) : (
                  <Link className="nav-link" to="/#about">{content[language].aboutUs}</Link>
                )}
              </li>
              <li className="nav-item">
                {isHomePage ? (
                  <AnchorLink className="nav-link" href="#movies">{content[language].vote}</AnchorLink>
                ) : (
                  <Link className="nav-link" to="/#movies">{content[language].vote}</Link>
                )}
              </li>
              <li className="nav-item">
                {isHomePage ? (
                  <AnchorLink className="nav-link" href="#team">{content[language].team}</AnchorLink>
                ) : (
                  <Link className="nav-link" to="/#team">{content[language].team}</Link>
                )}
              </li>
              <li className="nav-item"><Link className="nav-link" to="/events">{content[language].events}</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/contact">{content[language].contact}</Link></li>
            </ul>

            <div className="navbar-nav d-flex justify-content-start justify-content-lg-end ms-auto mt-2 mt-lg-0">
              <LanguageSwitcher />
                
                {user ? (
                  <>
                  <Dropdown>
                  <Dropdown.Toggle className="btn btn-nav signup">
                   {user.email}
                  </Dropdown.Toggle>
            
                  <Dropdown.Menu>
                    {user.isMember &&
                    <Dropdown.Item href="/users">Uživatelia</Dropdown.Item>
                  }
                  {user.isMember &&
                    <Dropdown.Item href="/members">Členovia</Dropdown.Item>
                  }
                  {user.isMember &&
                    <Dropdown.Item href="/movies">Filmy</Dropdown.Item>
                  }
                    <Dropdown.Item href={`/users/${user.userId}/userInfo`}>Nastavenia</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Odhlásiť</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                 
                  </>
                ) : (
                  <>
                  <button className="btn btn-nav login me-2" type="submit" onClick={openLoginModal}>{content[language].login}</button>
                  <button className="btn btn-nav signup" type="submit" onClick={openSignupModal}>{content[language].signup}</button>
                  </>
                )}
                
              
            </div>

          </div>
        </div>
        
      </nav>
      <LoginSignupModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        initialMode={modalMode}
      />
    </>
  );
}

export default Nav;
