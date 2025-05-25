import "../style/events.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

function Add_Event() {
    const { user } = useAuth();
    const isAdmin = user?.isAdmin;


    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        place: '',
        description: '',
        poster: null
    });

    const [posterPreview, setPosterPreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handlePosterChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, poster: file });

            const reader = new FileReader();
            reader.onload = () => {
                setPosterPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.poster) {
            setError("Nahraj plagát akcie");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (!user || !user.token) {
                console.error('No authentication token available');
                return;
            }

            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'poster' && formData.poster) {
                    submitData.append('poster', formData.poster);
                } else if (key !== 'poster') {
                    submitData.append(key, formData[key]);
                }
            });


            submitData.append('isPast', 'false');


            await axios.post('http://localhost:5001/api/events/add_event', submitData, {
                headers: {
                  Authorization: `Bearer ${user.token}`
                }
              });

            navigate('/events');

        } catch (error) {
            console.error("Chyba pri vytváranie akcie: ", error);
            setError(error.response?.data?.message || 'Nepodarilo sa vytvoriť akciu. Skúste prosím znova');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mt-4 p-5 header-events">
                <div className='header-events-text'>
                    <h1 className='header-events-title'>Vytvoriť akciu</h1>
                    <div className='header-events-path'>
                        <Link className="header-events-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / </p>
                        <Link className="header-events-link" to="/events">
                            <p>Akcie</p>
                        </Link>

                        <p> / Vytvoriť akciu</p>
                    </div>
                </div>
            </div>

            <div className="container container-incoming">
                <div className="title-events-incoming">
                    vytvoriť akciu
                </div>

                {error && <div className="error-message">{error}</div>}

                <form>
                    <div className="form-group">
                        <label htmlFor="title">Názov akcie</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Dátum</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="time">Čas</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="place">Miesto</label>
                        <input
                            type="text"
                            id="place"
                            name="place"
                            value={formData.place}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Popis akcie</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="poster">Plagát</label>
                        <input
                            type="file"
                            id="poster"
                            name="poster"
                            onChange={handlePosterChange}
                            accept="image/*"
                            className="file-input"
                            required
                        />
                        {posterPreview && (
                            <div className="image-preview poster-preview">
                                <img src={posterPreview} alt="Poster preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate("/events")}
                            className="cancel-button btn btn-danger"
                            disabled={loading}
                            >
                            Zruš
                        </button>

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="save-button btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Vytváram..." : "Vytvoriť akciu"}    
                            
                        </button>
                    </div>
                </form>

            </div>
        </>
    );
}

export default Add_Event;