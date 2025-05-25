import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function EventAddImages() {

    const { user } = useAuth();
    const isAdmin = user?.isAdmin;
    
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        if (eventId) {
            fetchEvents();
        }
    }, [eventId]); 

    const fetchEvents = async () => {
        try {
            setLoading(true);

            if (!user || !user.token) {
                console.error('No authentication token available');
                return;
            }
            
            const response = await axios.get(`http://localhost:5001/api/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            if (response.data.success) {
                setEvent(response.data.data);
                

                const images = response.data.data.images || [];

                const previews = images.map(img =>
                    `${img}`
                );
                setImagePreviews(previews);
            } else {
                setError("Nepodarilo sa načítať detaily o akcii");
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching event:', error);
            setError('Failed to load event details. Please try again later.');
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        if (!event || !event.images) return;

        if (index >= event.images.length) {
            const newIndex = index - event.images.length;
            const newFiles = [...imageFiles];
            newFiles.splice(newIndex, 1);
            setImageFiles(newFiles);

            const newPreviews = [...imagePreviews];
            newPreviews.splice(index, 1);
            setImagePreviews(newPreviews);
        }
        else {
            setEvent(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));

            const newPreviews = [...imagePreviews];
            newPreviews.splice(index, 1);
            setImagePreviews(newPreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!event) return;

        try {
            setSubmitting(true);
            setError(null);

            const formData = new FormData();

            if (event.images && event.images.length > 0) {
                event.images.forEach(img => {
                    formData.append('existingImages', img);
                });
            }

            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            const response = await axios.post(
                `http://localhost:5001/api/events/${eventId}/add-images`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log("Update response:", response.data);
            navigate('/events');
        } catch (error) {
            console.error('Error updating event images:', error);
            setError(error.response?.data?.message || 'Failed to update images. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading event details...</div>;
    }

    if (error && !event) {
        return (
            <div className="error-page">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/events')} className="btn btn-primary">
                    Back to Events
                </button>
            </div>
        );
    }

    if (!event) {
        return <div className="loading">No event data found</div>;
    }

    return (
        <>
            <div className="mt-4 p-5 header-events">
                <div className='header-events-text'>
                    <h1 className='header-events-title'>Správa fotografií: {event.title}</h1>
                    <div className='header-events-path'>
                        <Link className="header-events-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / </p>
                        <Link className="header-events-link" to="/events">
                            <p>Akcie</p>
                        </Link>
                        <p> / Správa fotografií</p>
                    </div>
                </div>
            </div>

            <div className="container mt-4">
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group mb-4">
                        <label htmlFor="images" className="form-label">Pridať fotografie</label>
                        <input
                            type="file"
                            id="images"
                            name="images"
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                            className="form-control"
                        />
                        <small className="text-muted">Môžete vybrať viac fotografií naraz.</small>
                    </div>

                    <h4>Aktuálne fotografie</h4>

                    {imagePreviews.length > 0 ? (
                        <div className="image-gallery mb-4">
                            <div className="row">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="col-md-3 mb-3">
                                        <div className="image-preview-container">
                                            <img src={preview} alt={`Preview ${index + 1}`} className="img-thumbnail" />
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm remove-image-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p>Žiadne fotografie nie sú dostupné. Nahrajte nejaké fotografie.</p>
                    )}

                    <div className="form-actions mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/events')}
                            className="btn btn-secondary me-2"
                            disabled={submitting}
                        >
                            Zrušiť
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Ukladám...' : 'Uložiť fotografie'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default EventAddImages;