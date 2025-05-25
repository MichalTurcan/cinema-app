import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const MoviesVote = () => {
    const [date, setDate] = useState('');
    const [type, setType] = useState('hlasovanie');
    const [movies, setMovies] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [solidMovie, setSolidMovie] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState(0);
    const [loadingMovies, setLoadingMovies] = useState(true);
    const [error, setError] = useState(null);
    const searchRef = useRef(null);

    const { user } = useAuth();

    const [editableMovieIds, setEditableMovieIds] = useState([]);

    const [allGenres, setAllGenres] = useState([]);
    const [selectedGenresMap, setSelectedGenresMap] = useState({});
    const [genreSearchTerm, setGenreSearchTerm] = useState('');
    const [activeGenreDropdown, setActiveGenreDropdown] = useState(null);
    const genreSearchRef = useRef(null);

    const [allActors, setAllActors] = useState([]);
    const [selectedActorsMap, setSelectedActorsMap] = useState({});
    const [actorSearchTerm, setActorSearchTerm] = useState('');
    const [activeActorDropdown, setActiveActorDropdown] = useState(null);
    const [isAddingNewActor, setIsAddingNewActor] = useState(false);
    const [newActorFirstName, setNewActorFirstName] = useState('');
    const [newActorLastName, setNewActorLastName] = useState('');
    const actorSearchRef = useRef(null);

    const [allDirectors, setAllDirectors] = useState([]);
    const [selectedDirectorsMap, setSelectedDirectorsMap] = useState({});
    const [directorSearchTerm, setDirectorSearchTerm] = useState('');
    const [activeDirectorDropdown, setActiveDirectorDropdown] = useState(null);
    const [isAddingNewDirector, setIsAddingNewDirector] = useState(false);
    const [newDirectorFirstName, setNewDirectorFirstName] = useState('');
    const [newDirectorLastName, setNewDirectorLastName] = useState('');
    const directorSearchRef = useRef(null);

    const [allScreenwriters, setAllScreenwriters] = useState([]);
    const [selectedScreenwritersMap, setSelectedScreenwritersMap] = useState({});
    const [screenwriterSearchTerm, setScreenwriterSearchTerm] = useState('');
    const [activeScreenwriterDropdown, setActiveScreenwriterDropdown] = useState(null);
    const [isAddingNewScreenwriter, setIsAddingNewScreenwriter] = useState(false);
    const [newScreenwriterFirstName, setNewScreenwriterFirstName] = useState('');
    const [newScreenwriterLastName, setNewScreenwriterLastName] = useState('');
    const screenwriterSearchRef = useRef(null);

    const isMovieEditable = (movieId) => {
        return editableMovieIds.includes(movieId);
    };

    const toggleEditMode = (movieId) => {
        if (isMovieEditable(movieId)) {
            setEditableMovieIds(editableMovieIds.filter(id => id !== movieId));
            setActiveGenreDropdown(null);
            setActiveActorDropdown(null);
            setActiveDirectorDropdown(null);
            setActiveScreenwriterDropdown(null);
            setIsAddingNewActor(false);
            setIsAddingNewDirector(false);
            setIsAddingNewScreenwriter(false);
        } else {
            setMovies(movies.map(movie => {
                if (movie.id === movieId && movie.edited_title === undefined) {
                    return { ...movie, edited_title: movie.title };
                }
                return movie;
            }));

            if (movies.find(m => m.id === movieId)?.genres) {
                const movieGenres = movies.find(m => m.id === movieId).genres || [];
                setSelectedGenresMap({
                    ...selectedGenresMap,
                    [movieId]: [...movieGenres]
                });
            } else {
                setSelectedGenresMap({
                    ...selectedGenresMap,
                    [movieId]: []
                });
            }

            if (movies.find(m => m.id === movieId)?.actors) {
                const movieActors = movies.find(m => m.id === movieId).actors || [];
                setSelectedActorsMap({
                    ...selectedActorsMap,
                    [movieId]: [...movieActors]
                });
            } else {
                setSelectedActorsMap({
                    ...selectedActorsMap,
                    [movieId]: []
                });
            }

            if (movies.find(m => m.id === movieId)?.directors) {
                const movieDirectors = movies.find(m => m.id === movieId).directors || [];
                setSelectedDirectorsMap({
                    ...selectedDirectorsMap,
                    [movieId]: [...movieDirectors]
                });
            } else {
                setSelectedDirectorsMap({
                    ...selectedDirectorsMap,
                    [movieId]: []
                });
            }

            if (movies.find(m => m.id === movieId)?.screenwriters) {
                const movieScreenwriters = movies.find(m => m.id === movieId).screenwriters || [];
                setSelectedScreenwritersMap({
                    ...selectedScreenwritersMap,
                    [movieId]: [...movieScreenwriters]
                });
            } else {
                setSelectedScreenwritersMap({
                    ...selectedScreenwritersMap,
                    [movieId]: []
                });
            }

            setEditableMovieIds([...editableMovieIds, movieId]);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingMovies(true);

                const moviesResponse = await axios.get('http://localhost:5001/api/movies', {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setMovies(moviesResponse.data);

                const genresResponse = await axios.get('http://localhost:5001/api/movies/genres', {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setAllGenres(genresResponse.data);

                const actorsResponse = await axios.get('http://localhost:5001/api/movies/actors', {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setAllActors(actorsResponse.data);

                const directorsResponse = await axios.get('http://localhost:5001/api/movies/directors', {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setAllDirectors(directorsResponse.data);

                const screenwritersResponse = await axios.get('http://localhost:5001/api/movies/screenwriters', {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setAllScreenwriters(screenwritersResponse.data);

                setLoadingMovies(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Nepodarilo sa načítať údaje. Skúste to prosím neskôr.');
                setLoadingMovies(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }

            if (genreSearchRef.current && !genreSearchRef.current.contains(event.target)) {
                setActiveGenreDropdown(null);
            }

            if (actorSearchRef.current && !actorSearchRef.current.contains(event.target)) {
                setActiveActorDropdown(null);
            }

            if (directorSearchRef.current && !directorSearchRef.current.contains(event.target)) {
                setActiveDirectorDropdown(null);
            }

            if (screenwriterSearchRef.current && !screenwriterSearchRef.current.contains(event.target)) {
                setActiveScreenwriterDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredMovies = movies.filter(movie =>
        (movie.edited_title || movie.title).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGenres = allGenres.filter(genre =>
        genre.name.toLowerCase().includes(genreSearchTerm.toLowerCase())
    );

    const filteredActors = allActors.filter(actor =>
        `${actor.first_name} ${actor.last_name}`.toLowerCase().includes(actorSearchTerm.toLowerCase())
    );

    const filteredDirectors = allDirectors.filter(director =>
        `${director.first_name} ${director.last_name}`.toLowerCase().includes(directorSearchTerm.toLowerCase())
    );

    const filteredScreenwriters = allScreenwriters.filter(screenwriter =>
        `${screenwriter.first_name} ${screenwriter.last_name}`.toLowerCase().includes(screenwriterSearchTerm.toLowerCase())
    );

    const addGenreToMovie = (movieId, genre) => {
        const currentGenres = selectedGenresMap[movieId] || [];
        if (!currentGenres.some(g => g.genre_id === genre.genre_id)) {
            const updatedGenres = [...currentGenres, genre];
            setSelectedGenresMap({
                ...selectedGenresMap,
                [movieId]: updatedGenres
            });

            setMovies(movies.map(movie => {
                if (movie.id === movieId) {
                    return {
                        ...movie,
                        genres: updatedGenres
                    };
                }
                return movie;
            }));

            if (solidMovie && solidMovie.id === movieId) {
                setSolidMovie({
                    ...solidMovie,
                    genres: updatedGenres
                });
            }

            setSelectedMovies(selectedMovies.map(movie => {
                if (movie && movie.id === movieId) {
                    return {
                        ...movie,
                        genres: updatedGenres
                    };
                }
                return movie;
            }));
        }

        setGenreSearchTerm('');
        setActiveGenreDropdown(null);
    };

    const removeGenreFromMovie = (movieId, genreId) => {
        const currentGenres = selectedGenresMap[movieId] || [];
        const updatedGenres = currentGenres.filter(g => g.genre_id !== genreId);

        setSelectedGenresMap({
            ...selectedGenresMap,
            [movieId]: updatedGenres
        });

        setMovies(movies.map(movie => {
            if (movie.id === movieId) {
                return {
                    ...movie,
                    genres: updatedGenres
                };
            }
            return movie;
        }));

        if (solidMovie && solidMovie.id === movieId) {
            setSolidMovie({
                ...solidMovie,
                genres: updatedGenres
            });
        }

        setSelectedMovies(selectedMovies.map(movie => {
            if (movie && movie.id === movieId) {
                return {
                    ...movie,
                    genres: updatedGenres
                };
            }
            return movie;
        }));
    };

    const addActorToMovie = (movieId, actor) => {
        const currentActors = selectedActorsMap[movieId] || [];

        if (!currentActors.some(a => a.actor_id === actor.actor_id)) {
            const updatedActors = [...currentActors, actor];
            setSelectedActorsMap({
                ...selectedActorsMap,
                [movieId]: updatedActors
            });

            setMovies(movies.map(movie => {
                if (movie.id === movieId) {
                    return {
                        ...movie,
                        actors: updatedActors
                    };
                }
                return movie;
            }));

            if (solidMovie && solidMovie.id == movieId) {
                setSolidMovie({
                    ...solidMovie,
                    actors: updatedActors
                });
            }

            setSelectedMovies(selectedMovies.map(movie => {
                if (movie && movie.id === movieId) {
                    return {
                        ...movie,
                        actors: updatedActors
                    };
                }
                return movie;
            }));
        }

        setActorSearchTerm('');
        setActiveActorDropdown(null);
    };

    const removeActorFromMovie = (movieId, actorId) => {
        const currentActors = selectedActorsMap[movieId] || [];
        const updatedActors = currentActors.filter(a => a.actor_id !== actorId);

        setSelectedActorsMap({
            ...selectedActorsMap,
            [movieId]: updatedActors
        });

        setMovies(movies.map(movie => {
            if (movie.id === movieId) {
                return {
                    ...movie,
                    actors: updatedActors
                };
            }

            return movie;
        }));

        if (solidMovie && solidMovie.id === movieId) {
            setSolidMovie({
                ...solidMovie,
                actors: updatedActors
            });
        }

        setSelectedMovies(selectedMovies.map(movie => {
            if (movie && movie.id === movieId) {
                return {
                    ...movie,
                    actors: updatedActors
                };
            }

            return movie;
        }));
    };

    const addNewActor = async (movieId) => {
        if (!newActorFirstName) {
            alert('Musíte zadať menoherca');
            return
        }

        try {
            const response = await axios.post('http://localhost:5001/api/movies/actors', {
                first_name: newActorFirstName,
                last_name: newActorLastName || ''
            },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });

            if (response.data.success) {
                const newActor = response.data.data;

                setAllActors([...allActors, newActor]);

                addActorToMovie(movieId, newActor);

                setNewActorFirstName('');
                setNewActorLastName('');
                setIsAddingNewActor(false);

                alert("Herec bol úspešne pridaný");
            } else {
                alert('Pridanie herca zlyhalo: ' + response.data.error);
            }
        } catch (error) {
            console.error('Chyba pri pridávaní herca:', error);
            alert('Nepodarilo sa pridať herca. Skúste to prosím znova.');
        }
    };

    const toggleNewActorForm = () => {
        setIsAddingNewActor(!isAddingNewActor);
        setNewActorFirstName('');
        setNewActorLastName('');
    };

    const addDirectorToMovie = (movieId, director) => {
        const currentDirectors = selectedDirectorsMap[movieId] || [];

        if (!currentDirectors.some(d => d.director_id === director.director_id)) {
            const updatedDirectors = [...currentDirectors, director];
            setSelectedDirectorsMap({
                ...selectedDirectorsMap,
                [movieId]: updatedDirectors
            });

            setMovies(movies.map(movie => {
                if (movie.id === movieId) {
                    return {
                        ...movie,
                        directors: updatedDirectors
                    };
                }
                return movie;
            }));

            if (solidMovie && solidMovie.id === movieId) {
                setSolidMovie({
                    ...solidMovie,
                    directors: updatedDirectors
                });
            }

            setSelectedMovies(selectedMovies.map(movie => {
                if (movie && movie.id === movieId) {
                    return {
                        ...movie,
                        directors: updatedDirectors
                    };
                }
                return movie;
            }));
        }

        setDirectorSearchTerm('');
        setActiveDirectorDropdown(null);
    };

    const removeDirectorFromMovie = (movieId, directorId) => {
        const currentDirectors = selectedDirectorsMap[movieId] || [];
        const updatedDirectors = currentDirectors.filter(d => d.director_id !== directorId);

        setSelectedDirectorsMap({
            ...selectedDirectorsMap,
            [movieId]: updatedDirectors
        });

        setMovies(movies.map(movie => {
            if (movie.id === movieId) {
                return {
                    ...movie,
                    directors: updatedDirectors
                };
            }
            return movie;
        }));

        if (solidMovie && solidMovie.id === movieId) {
            setSolidMovie({
                ...solidMovie,
                directors: updatedDirectors
            });
        }

        setSelectedMovies(selectedMovies.map(movie => {
            if (movie && movie.id === movieId) {
                return {
                    ...movie,
                    directors: updatedDirectors
                };
            }
            return movie;
        }));
    };

    const addNewDirector = async (movieId) => {
        if (!newDirectorFirstName) {
            alert('Musíte zadať meno režiséra');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/api/movies/directors', {
                first_name: newDirectorFirstName,
                last_name: newDirectorLastName || ''
            },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });

            if (response.data.success) {
                const newDirector = response.data.data;
                setAllDirectors([...allDirectors, newDirector]);
                addDirectorToMovie(movieId, newDirector);
                setNewDirectorFirstName('');
                setNewDirectorLastName('');
                setIsAddingNewDirector(false);
                alert("Režisér bol úspešne pridaný");
            } else {
                alert('Pridanie režiséra zlyhalo: ' + response.data.error);
            }
        } catch (error) {
            console.error('Chyba pri pridávaní režiséra:', error);
            alert('Nepodarilo sa pridať režiséra. Skúste to prosím znova.');
        }
    };

    const toggleNewDirectorForm = () => {
        setIsAddingNewDirector(!isAddingNewDirector);
        setNewDirectorFirstName('');
        setNewDirectorLastName('');
    };

    const addScreenwriterToMovie = (movieId, screenwriter) => {
        const currentScreenwriters = selectedScreenwritersMap[movieId] || [];

        if (!currentScreenwriters.some(s => s.screenwriter_id === screenwriter.screenwriter_id)) {
            const updatedScreenwriters = [...currentScreenwriters, screenwriter];
            setSelectedScreenwritersMap({
                ...selectedScreenwritersMap,
                [movieId]: updatedScreenwriters
            });

            setMovies(movies.map(movie => {
                if (movie.id === movieId) {
                    return {
                        ...movie,
                        screenwriters: updatedScreenwriters
                    };
                }
                return movie;
            }));

            if (solidMovie && solidMovie.id === movieId) {
                setSolidMovie({
                    ...solidMovie,
                    screenwriters: updatedScreenwriters
                });
            }

            setSelectedMovies(selectedMovies.map(movie => {
                if (movie && movie.id === movieId) {
                    return {
                        ...movie,
                        screenwriters: updatedScreenwriters
                    };
                }
                return movie;
            }));
        }

        setScreenwriterSearchTerm('');
        setActiveScreenwriterDropdown(null);
    };

    const removeScreenwriterFromMovie = (movieId, screenwriterId) => {
        const currentScreenwriters = selectedScreenwritersMap[movieId] || [];
        const updatedScreenwriters = currentScreenwriters.filter(s => s.screenwriter_id !== screenwriterId);

        setSelectedScreenwritersMap({
            ...selectedScreenwritersMap,
            [movieId]: updatedScreenwriters
        });

        setMovies(movies.map(movie => {
            if (movie.id === movieId) {
                return {
                    ...movie,
                    screenwriters: updatedScreenwriters
                };
            }
            return movie;
        }));

        if (solidMovie && solidMovie.id === movieId) {
            setSolidMovie({
                ...solidMovie,
                screenwriters: updatedScreenwriters
            });
        }

        setSelectedMovies(selectedMovies.map(movie => {
            if (movie && movie.id === movieId) {
                return {
                    ...movie,
                    screenwriters: updatedScreenwriters
                };
            }
            return movie;
        }));
    };

    const addNewScreenwriter = async (movieId) => {
        if (!newScreenwriterFirstName) {
            alert('Musíte zadať meno scenáristu');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/api/movies/screenwriters', {
                first_name: newScreenwriterFirstName,
                last_name: newScreenwriterLastName || ''
            },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });

            if (response.data.success) {
                const newScreenwriter = response.data.data;
                setAllScreenwriters([...allScreenwriters, newScreenwriter]);
                addScreenwriterToMovie(movieId, newScreenwriter);
                setNewScreenwriterFirstName('');
                setNewScreenwriterLastName('');
                setIsAddingNewScreenwriter(false);
                alert("Scenárista bol úspešne pridaný");
            } else {
                alert('Pridanie scenáristu zlyhalo: ' + response.data.error);
            }
        } catch (error) {
            console.error('Chyba pri pridávaní scenáristu:', error);
            alert('Nepodarilo sa pridať scenáristu. Skúste to prosím znova.');
        }
    };

    const toggleNewScreenwriterForm = () => {
        setIsAddingNewScreenwriter(!isAddingNewScreenwriter);
        setNewScreenwriterFirstName('');
        setNewScreenwriterLastName('');
    };

    const handleTypeChange = (newType) => {
        setType(newType);
        setSelectedMovies([]);
        setSolidMovie(null);
        setActiveColumn(0);
        setEditableMovieIds([]);
    };

    const handleSolidMovieSelect = (movie) => {
        setSolidMovie(movie);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleVotingMovieSelect = (movie) => {
        let newSelectedMovies = [...selectedMovies];
        const existingIndex = newSelectedMovies.findIndex(m => m && m.id === movie.id);

        if (existingIndex >= 0) {
            if (existingIndex === activeColumn) {
                newSelectedMovies[activeColumn] = null;
            } else {
                newSelectedMovies[activeColumn] = movie;
                newSelectedMovies[existingIndex] = null;
            }
        } else {
            newSelectedMovies[activeColumn] = movie;
        }

        setSelectedMovies(newSelectedMovies);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleMoviePropertyChange = (movieId, property, value) => {
        setMovies(movies.map(movie => {
            if (movie.id === movieId) {
                return { ...movie, [property]: value };
            }
            return movie;
        }));

        if (solidMovie && solidMovie.id === movieId) {
            setSolidMovie({ ...solidMovie, [property]: value });
        }

        setSelectedMovies(selectedMovies.map(movie => {
            if (movie && movie.id === movieId) {
                return { ...movie, [property]: value };
            }
            return movie;
        }));
    };

    const saveMovieChanges = async (movieId) => {
        try {
            const movieToUpdate = movies.find(movie => movie.id === movieId);

            if (!movieToUpdate) {
                console.error('Film sa nenašiel');
                return;
            }

            const movieGenres = selectedGenresMap[movieId] || [];
            const movieActors = selectedActorsMap[movieId] || [];
            const movieDirectors = selectedDirectorsMap[movieId] || [];
            const movieScreenwriters = selectedScreenwritersMap[movieId] || [];

            const updatedMovie = {
                title: movieToUpdate.edited_title !== undefined
                    ? movieToUpdate.edited_title
                    : movieToUpdate.title,
                year: movieToUpdate.year ? parseInt(movieToUpdate.year) : null,
                director: movieToUpdate.director || '',
                screenwriter: movieToUpdate.screenwriter || '',
                summary: movieToUpdate.summary || '',
                duration_seconds: movieToUpdate.duration_seconds ? parseInt(movieToUpdate.duration_seconds) : null,
                rating: movieToUpdate.rating ? parseFloat(movieToUpdate.rating) : null,
                video_url: movieToUpdate.video_url || '',
                poster_url: movieToUpdate.poster_url || '',
                background_url: movieToUpdate.background_url || '',
                genres: movieGenres.map(genre => genre.genre_id), 
                actors: movieActors.map(actor => actor.actor_id), 
                directors: movieDirectors.map(director => director.director_id),
                screenwriters: movieScreenwriters.map(screenwriter => screenwriter.screenwriter_id)
            };

            console.log(updatedMovie);

            const response = await axios.put(`http://localhost:5001/api/movies/editMovie/${movieId}`, updatedMovie,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            if (response.data.success) {
                const updatedMovieFromAPI = response.data.data;

                setMovies(movies.map(movie =>
                    movie.id === movieId ? updatedMovieFromAPI : movie
                ));

                if (type === 'pevny_film' && solidMovie && solidMovie.id === movieId) {
                    setSolidMovie(updatedMovieFromAPI);
                } else if (type === 'hlasovanie') {
                    const newSelectedMovies = [...selectedMovies];
                    selectedMovies.forEach((movie, index) => {
                        if (movie && movie.id === movieId) {
                            newSelectedMovies[index] = updatedMovieFromAPI;
                        }
                    });
                    setSelectedMovies(newSelectedMovies);
                }

                toggleEditMode(movieId);

                alert('Film bol úspešne aktualizovaný');
            } else {
                alert('Aktualizácia filmu zlyhala: ' + response.data.error);
            }
        } catch (err) {
            console.error('Chyba pri aktualizácii filmu:', err);
            alert('Nepodarilo sa aktualizovať film. Skúste to prosím znova.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = {
                date_of_screaning: date,
                type: type
            };

            if (type === 'pevny_film') {
                formData.solid_movie_id = solidMovie.id;
            } else {
                formData.voting_movies = selectedMovies
                    .filter(Boolean)
                    .map(movie => ({ movie_id: movie.id }));
            }

            const response = await axios.post('http://localhost:5001/api/movies/create_screening', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });


            alert('Filmy sa nastavili');

            setDate('');
            setType('hlasovanie');
            setSelectedMovies([]);
            setSolidMovie(null);

        } catch (err) {
            console.error('Error saving data:', err);
            alert('Nepodarilo sa uložiť data. Skúste to prosím znova.');
        }
    };

    const isFormValid = () => {
        if (!date) return false;

        if (type === 'pevny_film') {
            return solidMovie !== null;
        } else {
            return selectedMovies.filter(Boolean).length === 3;
        }
    };

    const getGenreNames = (movie) => {
        if (!movie.genres || !Array.isArray(movie.genres)) return '';
        return movie.genres.map(genre => genre.name).join(', ');
    };

    const getActorNames = (movie) => {
        if (!movie.actors || !Array.isArray(movie.actors)) return '';
        return movie.actors.map(actor => `${actor.first_name} ${actor.last_name}`).join(', ');
    }

    const getDirectorNames = (movie) => {
        if (!movie.directors || !Array.isArray(movie.directors)) return '';
        return movie.directors.map(director => `${director.first_name} ${director.last_name}`).join(', ');
    };

    const getScreenwriterNames = (movie) => {
        if (!movie.screenwriters || !Array.isArray(movie.screenwriters)) return '';
        return movie.screenwriters.map(screenwriter => `${screenwriter.first_name} ${screenwriter.last_name}`).join(', ');
    };

    const renderMovieCard = (movie) => {
        if (!movie) return null;

        if (isMovieEditable(movie.id)) {
            return (
                <div className="p-3">
                    <div className="flex flex-col">
                        <div className="form-group mb-2">
                            <label className="text-sm">Pôvodný názov</label>
                            <input
                                type="text"
                                className="form-control bg-gray-100"
                                value={movie.title || ''}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Upravený názov</label>
                            <input
                                type="text"
                                className="form-control"
                                value={movie.edited_title !== undefined ? movie.edited_title : movie.title}
                                onChange={(e) => handleMoviePropertyChange(movie.id, 'edited_title', e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Rok</label>
                            <input
                                type="number"
                                className="form-control"
                                value={movie.year || ''}
                                onChange={(e) => handleMoviePropertyChange(movie.id, 'year', e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Režiséri</label>

                            <div className="flex flex-wrap gap-1 mb-2">
                                {(selectedDirectorsMap[movie.id] || []).map(director => (
                                    <div key={director.director_id} className="bg-gray-200 rounded-full px-3 py-1 text-xs flex items-center">
                                        {director.first_name} {director.last_name}
                                        <button
                                            className="ml-1 text-gray-600 hover:text-gray-800"
                                            onClick={() => removeDirectorFromMovie(movie.id, director.director_id)}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div ref={directorSearchRef} className="relative">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Vyhľadať režiséra..."
                                    value={directorSearchTerm}
                                    onChange={(e) => setDirectorSearchTerm(e.target.value)}
                                    onClick={() => {
                                        setActiveDirectorDropdown(movie.id);
                                        setIsAddingNewDirector(false);
                                    }}
                                />

                                {activeDirectorDropdown === movie.id && !isAddingNewDirector && (
                                    <div className="border rounded position-absolute bg-white text-black z-1000 mt-1 w-full" style={{ maxHeight: '150px', overflow: 'auto' }}>
                                        {filteredDirectors.length > 0 ? (
                                            <>
                                                {filteredDirectors.map(director => (
                                                    <div
                                                        key={director.director_id}
                                                        className="p-2 border-bottom hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => addDirectorToMovie(movie.id, director)}
                                                    >
                                                        {director.first_name} {director.last_name}
                                                    </div>
                                                ))}
                                                <div
                                                    className="p-2 text-center text-primary border-top hover:bg-gray-100 cursor-pointer"
                                                    onClick={toggleNewDirectorForm}
                                                >
                                                    + Pridať nového režiséra
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2">Žiadní režiséri nenájdení</div>
                                                <div
                                                    className="p-2 text-center text-primary border-top hover:bg-gray-100 cursor-pointer"
                                                    onClick={toggleNewDirectorForm}
                                                >
                                                    + Pridať nového režiséra
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {isAddingNewDirector && activeDirectorDropdown === movie.id && (
                                    <div className="border rounded position-absolute bg-white text-black z-1000 mt-1 p-3 w-full">
                                        <h6 className="mb-2">Pridať nového režiséra</h6>
                                        <div className="form-group mb-2">
                                            <label className="text-sm">Meno</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newDirectorFirstName}
                                                onChange={(e) => setNewDirectorFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group mb-2">
                                            <label className="text-sm">Priezvisko</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newDirectorLastName}
                                                onChange={(e) => setNewDirectorLastName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-between">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={toggleNewDirectorForm}
                                            >
                                                Zrušiť
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => addNewDirector(movie.id)}
                                                disabled={!newDirectorFirstName}
                                            >
                                                Pridať
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="form-group mb-2">
                            <label className="text-sm">Scenáristi</label>

                            <div className="flex flex-wrap gap-1 mb-2">
                                {(selectedScreenwritersMap[movie.id] || []).map(screenwriter => (
                                    <div key={screenwriter.screenwriter_id} className="bg-gray-200 rounded-full px-3 py-1 text-xs flex items-center">
                                        {screenwriter.first_name} {screenwriter.last_name}
                                        <button
                                            className="ml-1 text-gray-600 hover:text-gray-800"
                                            onClick={() => removeScreenwriterFromMovie(movie.id, screenwriter.screenwriter_id)}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div ref={screenwriterSearchRef} className="relative">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Vyhľadať scenáristu..."
                                    value={screenwriterSearchTerm}
                                    onChange={(e) => setScreenwriterSearchTerm(e.target.value)}
                                    onClick={() => {
                                        setActiveScreenwriterDropdown(movie.id);
                                        setIsAddingNewScreenwriter(false);
                                    }}
                                />

                                {activeScreenwriterDropdown === movie.id && !isAddingNewScreenwriter && (
                                    <div className="border rounded position-absolute bg-white text-black z-1000 mt-1 w-full" style={{ maxHeight: '150px', overflow: 'auto' }}>
                                        {filteredScreenwriters.length > 0 ? (
                                            <>
                                                {filteredScreenwriters.map(screenwriter => (
                                                    <div
                                                        key={screenwriter.screenwriter_id}
                                                        className="p-2 border-bottom hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => addScreenwriterToMovie(movie.id, screenwriter)}
                                                    >
                                                        {screenwriter.first_name} {screenwriter.last_name}
                                                    </div>
                                                ))}
                                                <div
                                                    className="p-2 text-center text-primary border-top hover:bg-gray-100 cursor-pointer"
                                                    onClick={toggleNewScreenwriterForm}
                                                >
                                                    + Pridať nového scenáristu
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2">Žiadní scenáristi nenájdení</div>
                                                <div
                                                    className="p-2 text-center text-primary border-top hover:bg-gray-100 cursor-pointer"
                                                    onClick={toggleNewScreenwriterForm}
                                                >
                                                    + Pridať nového scenáristu
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {isAddingNewScreenwriter && activeScreenwriterDropdown === movie.id && (
                                    <div className="border rounded position-absolute bg-white text-black z-1000 mt-1 p-3 w-full">
                                        <h6 className="mb-2">Pridať nového scenáristu</h6>
                                        <div className="form-group mb-2">
                                            <label className="text-sm">Meno</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newScreenwriterFirstName}
                                                onChange={(e) => setNewScreenwriterFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group mb-2">
                                            <label className="text-sm">Priezvisko</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newScreenwriterLastName}
                                                onChange={(e) => setNewScreenwriterLastName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-between">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={toggleNewScreenwriterForm}
                                            >
                                                Zrušiť
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => addNewScreenwriter(movie.id)}
                                                disabled={!newScreenwriterFirstName}
                                            >
                                                Pridať
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="form-group mb-2">
                            <label className="text-sm">Popis</label>
                            <textarea
                                type="text"
                                className="form-control"
                                rows="4"
                                value={movie.summary || ''}
                                onChange={(e) => handleMoviePropertyChange(movie.id, 'summary', e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Dĺžka (min)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={movie.duration_seconds ? Math.floor(movie.duration_seconds / 60) : ''}
                                onChange={(e) => handleMoviePropertyChange(
                                    movie.id,
                                    'duration_seconds',
                                    e.target.value ? parseInt(e.target.value) * 60 : null
                                )}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Hodnotenie</label>
                            <input
                                type="number"
                                className="form-control"
                                value={movie.rating || ''}
                                onChange={(e) => handleMoviePropertyChange(movie.id, 'rating', e.target.value)}
                                step="0.1"
                                min="0"
                                max="10"
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Youtube trailer</label>
                            <input
                                type="text"
                                className="form-control"
                                value={movie.video_url || ''}
                                onChange={(e) => handleMoviePropertyChange(movie.id, 'video_url', e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">URL plagátu</label>
                            <input
                                type="text"
                                className="form-control"
                                value={movie.poster_url || ''}
                                onChange={(e) => handleMoviePropertyChange(movie.id, 'poster_url', e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">URL pozadia</label>
                            <input
                                type="text"
                                className="form-control"
                                value={movie.background_url || ''}
                                onChange={(e) => handleMoviePropertyChange(movie.id, 'background_url', e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Žánre</label>

                            <div className="flex flex-wrap gap-1 mb-2">
                                {(selectedGenresMap[movie.id] || []).map(genre => (
                                    <div key={genre.genre_id} >
                                        {genre.name}
                                        <button
                                            onClick={() => removeGenreFromMovie(movie.id, genre.genre_id)}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div ref={genreSearchRef} className="relative">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Vyhľadať žáner..."
                                    value={genreSearchTerm}
                                    onChange={(e) => setGenreSearchTerm(e.target.value)}
                                    onClick={() => setActiveGenreDropdown(movie.id)}
                                />

                                {activeGenreDropdown === movie.id && (
                                    <div className="border rounded position-absolute bg-white text-black z-1000 mt-1 w-full" style={{ maxHeight: '150px', overflow: 'auto' }}>
                                        {filteredGenres.length > 0 ? (
                                            filteredGenres.map(genre => (
                                                <div
                                                    key={genre.genre_id}
                                                    className="p-2 border-bottom hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => addGenreToMovie(movie.id, genre)}
                                                >
                                                    {genre.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2">Žiadne žánre nenájdené</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-sm">Herci</label>

                            <div className="flex flex-wrap gap-1 mb-2">
                                {(selectedActorsMap[movie.id] || []).map(actor => (
                                    <div key={actor.actor_id} className="bg-gray-200 rounded-full px-3 py-1 text-xs flex items-center">
                                        {actor.first_name} {actor.last_name}
                                        <button
                                            className="ml-1 text-gray-600 hover:text-gray-800"
                                            onClick={() => removeActorFromMovie(movie.id, actor.actor_id)}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div ref={actorSearchRef} className="relative">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Vyhľadať herca..."
                                    value={actorSearchTerm}
                                    onChange={(e) => setActorSearchTerm(e.target.value)}
                                    onClick={() => {
                                        setActiveActorDropdown(movie.id);
                                        setIsAddingNewActor(false);
                                    }}
                                />

                                {activeActorDropdown === movie.id && !isAddingNewActor && (
                                    <div className="border rounded position-absolute bg-white text-black z-1000 mt-1 w-full" style={{ maxHeight: '150px', overflow: 'auto' }}>
                                        {filteredActors.length > 0 ? (
                                            <>
                                                {filteredActors.map(actor => (
                                                    <div
                                                        key={actor.actor_id}
                                                        className="p-2 border-bottom hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => addActorToMovie(movie.id, actor)}
                                                    >
                                                        {actor.first_name} {actor.last_name}
                                                    </div>
                                                ))}
                                                <div
                                                    className="p-2 text-center text-primary border-top hover:bg-gray-100 cursor-pointer"
                                                    onClick={toggleNewActorForm}
                                                >
                                                    + Pridať nového herca
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2">Žiadní herci nenájdení</div>
                                                <div
                                                    className="p-2 text-center text-primary border-top hover:bg-gray-100 cursor-pointer"
                                                    onClick={toggleNewActorForm}
                                                >
                                                    + Pridať nového herca
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {isAddingNewActor && activeActorDropdown === movie.id && (
                                    <div className="border rounded position-absolute bg-white text-black z-1000 mt-1 p-3 w-full">
                                        <h6 className="mb-2">Pridať nového herca</h6>
                                        <div className="form-group mb-2">
                                            <label className="text-sm">Meno</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newActorFirstName}
                                                onChange={(e) => setNewActorFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group mb-2">
                                            <label className="text-sm">Priezvisko</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newActorLastName}
                                                onChange={(e) => setNewActorLastName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-between">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={toggleNewActorForm}
                                            >
                                                Zrušiť
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => addNewActor(movie.id)}
                                                disabled={!newActorFirstName}
                                            >
                                                Pridať
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 flex justify-between">
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleEditMode(movie.id);
                                }}
                            >
                                Zrušiť
                            </button>
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    saveMovieChanges(movie.id);
                                }}
                            >
                                Uložiť
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-3">
                <div className="flex">
                    {movie.poster_url && (
                        <img
                            src={movie.poster_url}
                            alt={`${movie.edited_title || movie.title} poster`}
                            className="object-cover rounded mr-3"
                            style={{ width: "100%" }}
                        />
                    )}
                    <div className="flex-1">
                        <h4 className="font-bold">
                            {movie.edited_title || movie.title} ({movie.year || 'N/A'})
                        </h4>
                        {movie.edited_title && movie.edited_title !== movie.title && (
                            <p className="text-xs text-gray-500">
                                <em>Pôvodný názov: {movie.title}</em>
                            </p>
                        )}
                        <p className="text-sm text-gray-600">{getGenreNames(movie)}</p>

                        {movie.actors && movie.actors.length > 0 && (
                            <p className="text-sm">Herci: {getActorNames(movie)}</p>
                        )}

                        {movie.directors && movie.directors.length > 0 && (
                            <p className="text-sm">Režiséri: {getDirectorNames(movie)}</p>
                        )}

                        {movie.screenwriters && movie.screenwriters.length > 0 && (
                            <p className="text-sm">Scenáristi: {getScreenwriterNames(movie)}</p>
                        )}
                        {movie.duration_seconds && (
                            <p className="text-sm">{Math.floor(movie.duration_seconds / 60)} min</p>
                        )}
                        {movie.rating && (
                            <p className="text-sm">⭐ {movie.rating.toFixed(1)}</p>
                        )}
                        <button
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (movie.edited_title === undefined) {
                                    handleMoviePropertyChange(movie.id, 'edited_title', movie.title);
                                }
                                toggleEditMode(movie.id);
                            }}
                        >
                            Upraviť
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderMovieSearchResult = (movie) => {
        return (
            <div
                key={movie.id}
                className="p-2 border-bottom d-flex justify-content-between align-items-center"
                onClick={() => {
                    if (type === 'pevny_film') {
                        handleSolidMovieSelect(movie);
                    } else {
                        handleVotingMovieSelect(movie);
                    }
                }}
                style={{ cursor: 'pointer' }}
            >
                <div>
                    {movie.edited_title || movie.title} ({movie.year || 'N/A'})
                    {movie.edited_title && movie.edited_title !== movie.title && (
                        <div className="text-xs text-gray-500">
                            <em>Pôv: {movie.title}</em>
                        </div>
                    )}
                </div>
                <button
                    className="btn btn-sm btn-outline-primary ml-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (movie.edited_title === undefined) {
                            handleMoviePropertyChange(movie.id, 'edited_title', movie.title);
                        }
                        toggleEditMode(movie.id);
                        setIsDropdownOpen(false);
                    }}
                >
                    Upraviť
                </button>
            </div>
        );
    };

    if (loadingMovies) {
        return <div className="text-center p-6">Načítavam filmy...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-6">{error}</div>;
    }

    return (
        <>
            <div className="mt-4 p-5 header-AboutUs">
                <div className='header-AboutUs-text'>
                    <h1 className='header-AboutUs-title'>Vytvoriť hlasovanie</h1>
                    <div className='header-AboutUs-path'>
                        <Link className="header-AboutUs-link" to="/">
                            <p>Home</p>
                        </Link>
                        <Link className="header-AboutUs-link" to="/movies">
                            <p> / Filmy</p>
                        </Link>
                        <p> / Vytvoriť hlasovanie</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-md">
                <div className="container mt-4">
                    <div className="row">
                        <div className="col-12">
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group ">
                                        <label htmlFor="date">Dátum</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Typ výberu</label>
                                        <div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    id="hlasovanie"
                                                    value="hlasovanie"
                                                    checked={type === 'hlasovanie'}
                                                    onChange={() => handleTypeChange('hlasovanie')}
                                                />
                                                <label className="form-check-label" htmlFor="hlasovanie">
                                                    Hlasovanie
                                                </label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    id="pevny_film"
                                                    value="pevny_film"
                                                    checked={type === 'pevny_film'}
                                                    onChange={() => handleTypeChange('pevny_film')}
                                                />
                                                <label className="form-check-label" htmlFor="pevny_film">
                                                    Pevný film
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {type === 'hlasovanie' && (
                                    <div className="form-group">
                                        <div className="form-group mt-3" ref={searchRef}>
                                            <label htmlFor="searchMovie">Vyhľadať film</label>
                                            <input
                                                type="text"
                                                id="searchMovie"
                                                placeholder="Zadajte názov filmu..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setIsDropdownOpen(true);
                                                }}
                                                onClick={() => setIsDropdownOpen(true)}
                                            />
                                            {isDropdownOpen && (
                                                <div className="border rounded position-absolute bg-white text-black z-1000 mt-1" style={{ maxHeight: '200px', overflow: 'auto', width: '100%' }}>
                                                    {filteredMovies.length > 0 ? (
                                                        filteredMovies.map((movie) => renderMovieSearchResult(movie))
                                                    ) : (
                                                        <div className="p-2">Žiadne filmy nenájdené</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="row">
                                            {[0, 1, 2].map((columnIndex) => (
                                                <div key={columnIndex} className="col-md-4 mb-3">
                                                    <div
                                                        className={`border p-3 h-100 ${activeColumn === columnIndex ? 'border-primary' : ''}`}
                                                        onClick={() => setActiveColumn(columnIndex)}
                                                        style={{ cursor: 'pointer', minHeight: '150px' }}
                                                    >
                                                        {selectedMovies[columnIndex] ? (
                                                            renderMovieCard(selectedMovies[columnIndex])
                                                        ) : (
                                                            <div className="text-center py-5">
                                                                <span>OPT {columnIndex + 1}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {type === 'pevny_film' && (
                                    <div className="form-group" ref={searchRef}>
                                        <label htmlFor="searchSolidMovie">Vyhľadať film</label>
                                        <input
                                            type="text"
                                            id="searchSolidMovie"
                                            placeholder="Zadajte názov filmu..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onClick={() => setIsDropdownOpen(true)}
                                        />
                                        {isDropdownOpen && (
                                            <div className="border rounded position-absolute bg-white text-black z-1000 mt-1" style={{ maxHeight: '200px', overflow: 'auto', width: '100%' }}>
                                                {filteredMovies.length > 0 ? (
                                                    filteredMovies.map((movie) => renderMovieSearchResult(movie))
                                                ) : (
                                                    <div className="p-2">Žiadne filmy nenájdené</div>
                                                )}
                                            </div>
                                        )}
                                        <label>Vybraný film</label>
                                        <div className="border p-3 mb-3" style={{ minHeight: '100px' }}>
                                            {solidMovie ? (
                                                renderMovieCard(solidMovie)
                                            ) : (
                                                <div className="text-center py-4">
                                                    <span>Žiadny film nie je vybraný</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!isFormValid()}
                                    >
                                        Uložiť
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MoviesVote;