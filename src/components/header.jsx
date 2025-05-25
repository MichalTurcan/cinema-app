import "../style/header.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Reservation from './reservation';
import React from "react";

import { useAuth } from "../context/AuthContext";

import { LanguageContext } from '../context/LenguageContext';
import { useContext } from 'react';

const VideoModal = ({ videoId, isOpenVideo, onCloseVideo }) => {
  if (!isOpenVideo) return null;

  return (
    <div className="modal ">
      <div className="modal-content">
        <button className="close" onClick={onCloseVideo}>X</button>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>

  );
}

const ReservationModal = ({ isOpenRes, onCloseRes }) => {
  if (!isOpenRes) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close" onClick={onCloseRes}>X</button>
        <Reservation />
      </div>
    </div>

  );
}

const handleOpenMovieInfo = async (movieId) => {
  try {
      await axios.get(`http://localhost:5001/api/movies/${movieId}/movieInfo`);
      window.location.href = `/${movieId}/movieInfo`;

  } catch (error) {
      console.error("Chyba pri načítavani filmu: ", error);
  }
}





function Header() {
  const [isOpenVideo, setIsOpenVideo] = useState(false);
  const [isOpenRes, setIsOpenRes] = useState(false);
  const [screeningData, setScreeningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const fetchScreeningData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/movies/today-screening');

        setScreeningData(response.data);
        setLoading(false)
      } catch (error) {
        console.error('Error fetching screening data:', error);
        setError('Nepodarilo sa načítať dáta o dnešnom premietaní');
        setLoading(false);
      }
    };

    fetchScreeningData();
  }, []);

  if (loading) {
    return <div>Načítavam informácie o dnešnom premietaní...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!screeningData.hasScreeningToday) {
    return <div>Dnes sa nekoná žiadne premietanie.</div>;
  }

  if (!screeningData.winnerDetermined) {
    return <div>Výsledky hlasovania budú známe o 8:00.</div>;
  }



  const { winner } = screeningData.screening;

  const actors = screeningData.screening.actors;


  function extractYouTubeId(url) {
    if (!url) return '';

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : '';
  }

  const videoId = winner && winner.video_url ? extractYouTubeId(winner.video_url) : "";


  const content = {
    en: {
      day: 'Monday',
      trailer: "watch trailer",
      more: "Find out more",
      reservation: "Reserve your seat"

    },
    sk: {
      day: 'Pondelok',
      trailer: "pozerať trailer",
      more: "Zistite viac",
      reservation: "Rezervujte si miesto"
    }
  };

  const formDate = (dateString) => {
    const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('sk-SK', dateOptions);

    return formattedDate.replace(/\. /g, '.');
  }

  const getDayName = (dateString, language) => {
    const date = new Date(dateString);
    const options = { weekday: 'long' };

    if (language === 'sk') {
      return date.toLocaleDateString('sk-SK', options);
    } else {
      return date.toLocaleDateString('en-US', options);
    }
  };

  const dayName = getDayName(screeningData.screening.date_of_screaning, language);

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to bottom,
      var(--primary-transparent) var(--percentage-primary),
      var(--primary-semi) var(--percentage-second),
      var(--primary-dark) var(--percentage-third)),
    linear-gradient(to top,
      var(--secondary-transparent) 80%,
      var(--secondary-semi) 90%,
      var(--secondary-dark) 100%),
    url('${winner.background_url}')`
  };

  return (
    <header id="header">

      <div id="header" className="p-5 text-center bg-image" style={backgroundStyle}>
        <div className="mask" >
          <div className="d-flex justify-content-center align-items-start">
            <div className="text-white projection">
              {dayName} {formDate(screeningData.screening.date_of_screaning)} 20:00
            </div>
          </div>

          <div className="d-flex justify-content-center align-items-end h-100 film-info">

            <div class="text-white">
              {videoId && (
                <div className="trailer">
                  <button className="btn play-trailer-btn me-3" onClick={() => setIsOpenVideo(true)}> <i class="bi bi-play-fill"></i> </button>

                  {content[language].trailer}



                </div>
              )}

              <h1 className="mb-3 film-title">{winner.title}</h1>
              <h5 className="mb-4 film-actors">
                {actors.slice(0, Math.min(4, actors.length)).map((actor, index) => (
                  <React.Fragment key={index}>
                    {actor.first_name} {actor.last_name}
                    {index < Math.min(4, actors.length) - 1 ? " | " : ""}
                  </React.Fragment>
                ))}
              </h5>

              <button className="btn btn-outline-light btn-lg m-2 btn-movie" type="submit" onClick={() => handleOpenMovieInfo(winner.id)}> {content[language].more}</button>

              {user && 
              <button class="btn btn-outline-light btn-lg m-2 btn-movie" onClick={() => setIsOpenRes(true)}>{content[language].reservation}</button>
            }
              </div>
          </div>
        </div>
      </div>


      <VideoModal videoId={videoId} isOpenVideo={isOpenVideo} onCloseVideo={() => setIsOpenVideo(false)} />
      <ReservationModal isOpenRes={isOpenRes} onCloseRes={() => setIsOpenRes(false)} />
    </header>
  );
}

export default Header;