import { Link } from "react-router-dom";
import "../style/movieInfo.css";
import FadeAnimation from "../animations/fade";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MovieInfo() {
    const { movieId } = useParams();

    const [movieData, setMovieData] = useState(null);
    const [closesScreening, setClosesScreening] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMovieInfo = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5001/api/movies/${movieId}/movieInfo`);

            const closesScreeningResponse = await axios.get(`http://localhost:5001/api/movies/closes-screening`);

            const movieDataArray = response.data.data;
            const movieGenresArray = response.data.genres;
            const movieActorsArray = response.data.actors;
            const movieDirectorsArray = response.data.directors;
            const movieScreenwritersArray = response.data.screenwriters;

            const closesScreeningArray = closesScreeningResponse.data.data;

            setClosesScreening(closesScreeningArray);

            if (Array.isArray(movieDataArray) && movieDataArray.length > 0) {
                const movieWithGenres = {
                    ...movieDataArray[0],
                    genres: movieGenresArray,
                    actors: movieActorsArray,
                    directors: movieDirectorsArray,
                    screenwriters: movieScreenwritersArray
                };
                setMovieData(movieWithGenres);
            } else {
                setError('No movie data found');
            }
        } catch (error) {
            setError('Failed to load movie information');
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (movieId) {
            fetchMovieInfo();
        }
    }, [movieId]);


    if (loading) return <div>Loading movie information...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!movieData) return <div>No movie data found</div>;

    console.log(closesScreening);

    function extractYouTubeId(url) {
        if (!url) return '';

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11) ? match[2] : '';
    }

    const videoId = movieData && movieData.video_url ? extractYouTubeId(movieData.video_url) : "";


    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, 
        rgba(0,0,0,0.6) 0%, 
        rgba(0,0,0, 0.6) 100%),
        url('${movieData.background_url}')`
    };


    return (
        <>
            <div className="mt-4 p-5 header-movieInfo" style={backgroundStyle}>
                <div className='header-movieInfo-text'>
                    <h1 className='header-movieInfo-title'>
                        {movieData.edited_title
                            ? movieData.edited_title
                            : movieData.title}
                    </h1>
                    <div className='header-movieInfo-path'>
                        <Link className="header-movieInfo-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / {movieData.title}</p>
                    </div>

                </div>

            </div>

            <div className="container">
                <div className="row">
                    <div className="col-12 col-lg-9 col-md-8 col-sm-12">
                        <FadeAnimation animationDirection="fade-right" >
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen
                                className="movieInfo-trailer"
                            ></iframe>
                        </FadeAnimation>
                        <FadeAnimation animationDirection="fade-up">
                            <h1 className="aboutUs-subtitle">{movieData.title} ({movieData.year})</h1>
                        </FadeAnimation>
                        <div className="movieInfo-rating-duration">
                            <i class="card-icon bi bi-star-fill"></i>{(movieData.rating).toFixed(1)}
                            <i className="card-icon movie-Info-duraton bi bi-clock-fill"></i>{Math.floor(movieData.duration_seconds / 60)} Min
                        </div>
                        <p className="movieInfo-description">
                            {movieData.summary}
                        </p>

                        <FadeAnimation animationDirection="fade-up">
                            <table className="movie-info-table">
                                <tbody>
                                    <tr>
                                        <th>Žáner:</th>
                                        <td>
                                            {movieData.genres && movieData.genres.length > 0
                                                ? movieData.genres.map(genre => genre.name).join(' / ')
                                                : ''}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Réžia:</th>
                                        <td>{movieData.directors && movieData.directors.length > 0
                                                ? movieData.directors.map(director => `${director.first_name} ${director.last_name}`).join(', ')
                                                : ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Scenár:</th>
                                        <td>{movieData.screenwriters && movieData.screenwriters.length > 0
                                                ? movieData.screenwriters.map(screenwriter => `${screenwriter.first_name} ${screenwriter.last_name}`).join(', ')
                                                : ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Hrajú:</th>
                                        <td>
                                            {movieData.actors && movieData.actors.length > 0
                                                ? movieData.actors.map(actor => `${actor.first_name} ${actor.last_name}`).join(', ')
                                                : ''}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </FadeAnimation>

                    </div>
                    <FadeAnimation animationDirection="fade-up" className="col-12 col-lg-3 col-md-4 col-sm-12 next-movies">
                        <h5 className="incoming-title">Najbližšie hlasovanie</h5>

                        {closesScreening.map(movie => (
                            <div key={movie.id} className="incoming-movies">

                                {movie.background_url
                                    ? <img src={movie.background_url} alt={movie.title} ></img>
                                    : <img src={movie.poster_url} alt={movie.title} ></img>
                                }

                                {movie.edited_title
                                    ? <h5>{movie.edited_title} ({movie.year})</h5>
                                    : <h5>{movie.title} ({movie.year})</h5>
                                }


                                <div className="movieInfo-rating-duration">
                                    <i className="card-icon bi bi-star-fill"></i> {movie.rating 
                                    ? movie.rating 
                                    : "?"}

                                    <i className="card-icon movie-Info-duraton bi bi-clock-fill"></i> {movie.duration_seconds 
                                    ? Math.floor(movie.duration_seconds / 60) + " Min"
                                    : "?"}

                                    
                                    
                                </div>
                            </div>
                        ))}
                    </FadeAnimation>
                </div>

            </div>
        </>
    );
}

export default MovieInfo;