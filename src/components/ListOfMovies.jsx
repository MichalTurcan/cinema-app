import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {useAuth} from "../context/AuthContext";

const MOVIES_PER_PAGE = 52;

function PlexMovies() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const { user } = useAuth();


  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5001/api/movies', {
          headers: {
              Authorization: `Bearer ${user.token}`
          }
      });
        setMovies(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to fetch movies. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSyncClick = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage("Syncing with Jellyfin...");

      
      const response = await axios.post('http://localhost:5001/api/movies/sync', 
        {},
        {
        headers: {
            Authorization: `Bearer ${user.token}`
        }
    });
      
      setSyncMessage(`Sync completed: ${response.data.stats.added} movies added, ${response.data.stats.updated} movies updated`);
      
      const moviesResponse = await axios.get('http://localhost:5001/api/movies', {
        headers: {
            Authorization: `Bearer ${user.token}`
        }
    });
      setMovies(moviesResponse.data);
    } catch (err) {
      console.error("Error syncing with Jellyfin:", err);
      setSyncMessage("Failed to sync with Jellyfin. Please try again later.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncMessage(null);
      }, 5000);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastMovie = currentPage * MOVIES_PER_PAGE;
  const indexOfFirstMovie = indexOfLastMovie - MOVIES_PER_PAGE;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);


  useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm]);

  if (isLoading) {
    return <div className="text-center mt-5">Loading movies...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <div className="container mt-4">
      <div className="row mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control mb-3 search"
              placeholder="Hľadať podľa mena..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-6 text-end">
            {user.isAdmin && 
          <Link className="btn btn-danger" to="/movies/create_vote">Vytvoriť hlasovanie</Link>
        }
            <button 
              className="btn btn-primary"
              onClick={handleSyncClick}
              disabled={isSyncing}
            >
              {isSyncing ? "Syncing..." : "Sync with Jellyfin"}
            </button>
          </div>
        </div>
        
        {syncMessage && (
          <div className="alert alert-info mb-4">{syncMessage}</div>
        )}
        <div className="row">
          {currentMovies.map((movie, index) => (
            <div key={index} className="col-6 col-md-3 mb-4">
              <div className="card bg-dark text-white">
                {movie.poster_url && (
                  <img 
                    src={movie.poster_url} 
                    alt={movie.title} 
                    className="card-img-top" 
                  />
                )}
                <div className="card-body text-center">
                  <h5 className="card-title">{movie.title}</h5>
                  <p className="card-text">
                    {movie.year} | {movie.rating ? `Rating: ${movie.rating}` : 'No rating'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMovies.length > 0 ? (
          <nav>
            <ul className="pagination justify-content-center mt-4">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li 
                  key={i} 
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        ) : (
          <div className="text-center mt-4">No movies found.</div>
        )}
      </div>
    </>
  );
}

export default PlexMovies;