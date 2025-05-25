import "../style/movies.css";
import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageContext } from '../context/LenguageContext';
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VideoModal = ({ trailerId, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close" onClick={onClose}>X</button>
                <iframe
                    src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

function Movies() {
    const [votingData, setVotingData] = useState({});
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTrailerId, setCurrentTrailerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { isAuthenticated, user } = useAuth();
    const { language } = useContext(LanguageContext);

    useEffect(() => {
        const fetchVotingData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5001/api/movies/active-voting');

                if (response.data.length === 0) {
                    setVotingData({});
                    setLoading(false);
                    return;
                }

                const formattedData = {};
                response.data.forEach(voteDate => {
                    const dayOfWeek = new Date(voteDate.date_of_screaning)
                        .toLocaleDateString('sk-SK', { weekday: 'long' })
                        .toLowerCase();

                    formattedData[dayOfWeek] = {
                        date: new Date(voteDate.date_of_screaning).toLocaleDateString('sk-SK'),
                        dateId: voteDate.id,
                        movies: voteDate.movies.map(movie => ({
                            id: movie.id,
                            title: movie.title,
                            edited_title: movie.edited_title,
                            year: movie.year || '',
                            img: movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster',
                            trailerId: extractYouTubeId(movie.video_url),
                            duration: movie.duration_seconds ? Math.floor(movie.duration_seconds / 60) : 120
                        }))
                    };
                });

                setVotingData(formattedData);

                if (Object.keys(formattedData).length > 0) {
                    setSelectedDay(Object.keys(formattedData)[0]);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching voting data:', err);
                setError('Nepodarilo sa načítať dáta');
                setLoading(false);
            }
        };

        fetchVotingData();
    }, []);

    const extractYouTubeId = (url) => {
        if (!url) return '';

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11) ? match[2] : '';
    };

    const handleConfirmSelection = async () => {
        console.log(" Toto je ci je prihlaseny: ", isAuthenticated());

        if (!isAuthenticated()) {
            alert(content[language].loginRequired);
            return;
        }

        if (selectedMovie && selectedDay) {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId"); 

                await axios.post('http://localhost:5001/api/movies/vote', {
                    dateId: votingData[selectedDay].dateId,
                    movieId: selectedMovie.id,
                    userId: userId 
                }, {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });

                alert(content[language].voteSuccess);
                setSelectedMovie(null);
            } catch (err) {
                console.error('Error submitting vote:', err);

                if (err.response && err.response.status === 401) {
                    alert(content[language].sessionExpired);
                } else if (err.response && err.response.status === 400 && err.response.data.error === 'Already voted') {
                    alert(content[language].alreadyVoted);
                } else {
                    alert(content[language].voteError);
                }
            }
        }
    };

    const content = {
        en: {
            title: "vote",
            pondelok: "Monday",
            utorok: "Tuesday",
            streda: "Wednesday",
            confirm: "Confirm vote",
            chosen: "Chosen",
            on: "on",
            loading: "Loading voting data...",
            error: "Error loading voting data",
            noVoting: "No active voting available",
            voteSuccess: "Your vote has been recorded!",
            voteError: "Error submitting your vote. Please try again.",
            alreadyVoted: "You have already voted for this date",
            loginRequired: "Please log in to vote",
            loginButton: "Log in",
            sessionExpired: "Your session has expired. Please log in again."
        },
        sk: {
            title: "hlasovanie",
            pondelok: "Pondelok",
            utorok: "Utorok",
            streda: "Streda",
            confirm: "Potvrdiť hlas",
            chosen: "Zvolené",
            on: "na",
            loading: "Načítavam hlasovanie...",
            error: "Chyba pri načítaní hlasovania",
            noVoting: "Žiadne aktívne hlasovanie nie je dostupné",
            voteSuccess: "Váš hlas bol zaznamenaný!",
            voteError: "Chyba pri odosielaní hlasu. Skúste to znova.",
            alreadyVoted: "Pre tento dátum ste už hlasovali",
            loginRequired: "Pre hlasovanie sa prosím prihláste",
            loginButton: "Prihlásiť sa",
            sessionExpired: "Vaša relácia vypršala. Prosím, prihláste sa znova."
        }
    };

    if (loading) {
        return (
            <section id="movies">
                <div className="container">
                    <div className="title-movies">
                        {content[language].title}
                    </div>
                    <div className="text-center py-4">
                        <div className="spinner-border text-light" role="status">
                            <span className="visually-hidden">{content[language].loading}</span>
                        </div>
                        <p className="mt-3 text-light">{content[language].loading}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="movies">
                <div className="container">
                    <div className="title-movies">
                        {content[language].title}
                    </div>
                    <div className="alert alert-danger text-center">
                        {error}
                    </div>
                </div>
            </section>
        );
    }

    if (Object.keys(votingData).length === 0) {
        return (
            <section id="movies">
                <div className="container">
                    <div className="title-movies">
                        {content[language].title}
                    </div>
                    <div className="text-center py-4">
                        <p className="text-light">{content[language].noVoting}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="movies">
            <div className="container">
                <div className="title-movies">
                    {content[language].title}
                </div>

                <div className="row justify-content-center">
                    {Object.keys(votingData).map((day) => {
                        const translatedDay = content[language]?.[day] || day;
                        return (
                            <div key={day} className="col-12 col-lg-4 col-md-4 col-sm-12 d-flex justify-content-center">
                                <button
                                    className={`btn btn-select-day ${selectedDay === day ? "btn-active-day" : "btn-nonactive-day"}`}
                                    onClick={() => {
                                        setSelectedDay(day);
                                        setSelectedMovie(null);
                                    }}
                                >
                                    {translatedDay.charAt(0).toUpperCase() + translatedDay.slice(1)} {votingData[day].date}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {selectedDay && (
                        <motion.div
                            key={selectedDay}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="row">
                            {votingData[selectedDay].movies.map((movie) => (
                                <div key={movie.id} className="col-md-4">
                                    {isAuthenticated() ?
                                        <input
                                            type="radio"
                                            name="movieSelection"
                                            id={`movie-${movie.id}`}
                                            value={movie.id}
                                            className="d-none"
                                            onChange={() => setSelectedMovie(movie)}
                                            checked={selectedMovie?.id === movie.id}
                                        />
                                        : <></>}
                                    <label
                                        htmlFor={`movie-${movie.id}`}
                                        className="card movie-card w-100"
                                        style={{
                                            backgroundImage: `linear-gradient(to bottom,
                      rgba(13,13,13, 0) 30%,
                      rgba(13,13,13, 0.9) 80%,
                      rgba(13,13,13, 1) 110%), url(${movie.img})`
                                        }}
                                    >
                                        <div className="card-body">
                                            {movie.trailerId && (
                                                <button className="btn play-trailer-btn me-3" onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentTrailerId(movie.trailerId);
                                                    setIsOpen(true);
                                                }}>
                                                    <i className="bi bi-play-fill"></i>
                                                </button>
                                            )}
                                            <h2 className="card-title">
                                                {movie.edited_title 
                                                ? movie.edited_title
                                                : movie.title} 
                                                {' '}({movie.year})</h2>
                                            
                                            <div className="card-time">
                                                <i className="card-icon bi bi-clock-fill"></i>
                                                {movie.duration}min
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="row mt-4"
                >
                    <div className="col-12 vote-movie">
                        {isAuthenticated() ?
                            <button
                                className="btn vote-movie-btn"
                                disabled={!selectedMovie || !isAuthenticated}
                                onClick={handleConfirmSelection}
                            >
                                {content[language].confirm}

                            </button>
                            : <></>}
                        {!isAuthenticated && (
                            <div className="mt-2 text-center">
                                <Link to="/login" className="btn btn-sm btn-outline-light">
                                    {content[language].loginButton}
                                </Link>
                            </div>
                        )}

                        
                        {selectedMovie && isAuthenticated() && (
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="selected-movie text-white"
                            >
                                {content[language].chosen}: <strong>{selectedMovie.title}</strong> {content[language].on} {content[language][selectedDay] || selectedDay} {votingData[selectedDay].date}
                            </motion.span>
                        )}
                    
                    </div>
                </motion.div>
            </div>

            <VideoModal
                trailerId={currentTrailerId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </section>
    );
}

export default Movies;