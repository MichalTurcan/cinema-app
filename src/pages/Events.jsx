import "../style/events.css";
import { Link } from "react-router-dom";
import PosterLightbox from "../components/lightbox-gallery";
import FadeAnimation from "../animations/fade";
import axios from "axios";
import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";

function Events() {
    const [events, setEvents] = useState([]);

    const { user } = useAuth();
    const isAdmin = user?.isAdmin;

    const fetchEvents = async () => {
        try {
            console.log("Fetching events...");

            const response = await axios.get('http://localhost:5001/api/events');

            console.log('Response received: ', response);
            const eventsData = response.data.data || response.data || [];
            console.log('Events data: ', eventsData);
            setEvents(eventsData);
        } catch (error) {
            console.error('Error loading events:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const upcomingEvents = events.filter(event => !event.is_past);
    const pastEvents = events.filter(event => event.is_past);


    const formDate = (dateString) => {
        const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('sk-SK', dateOptions);
    };

    const formTime = (timeString) => {
        let time;

        if (timeString.includes('T')) {
            time = new Date(timeString);
        } else if (timeString.includes(':')) {
            const parts = timeString.split(':');
            time = new Date();
            time.setHours(parseInt(parts[0], 10));
            time.setMinutes(parseInt(parts[1], 10));
        } else {
            return timeString;
        }

        return time.toLocaleTimeString('sk-SK', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            if (!user || !user.token) {
                console.error('No authentication token available');
                return;
            }

            await axios.post(
                `http://localhost:5001/api/events/${eventId}/deleteEvent`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                },
            );
            console.log(eventId);
            fetchEvents();
        } catch (error) {
            console.error("Chyba pri odstraňovani akcie: ", error);
        }
    }

    return (
        <>
            <div className="mt-4 p-5 header-events">
                <div className='header-events-text'>
                    <h1 className='header-events-title'>Akcie</h1>
                    <div className='header-events-path'>
                        <Link className="header-events-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / Akcie</p>
                    </div>

                </div>

            </div>

            <section id='events'>
                <div className="container">
                    {isAdmin &&
                        <div className="add-event">
                            <Link className="btn btn-nav login my-2" to="/events/add_events">Pridať akciu</Link>
                        </div>
                    }
                </div>

                {upcomingEvents.length === 0 ? (
                    <></>
                ) :
                    <div className="container container-incoming">
                        <div className="title-events-incoming">
                            bližiace sa akcie
                        </div>
                        {upcomingEvents.map(event => (


                            <div className="row">
                                <FadeAnimation animationDirection="fade-right" className="col-12 col-lg-4 col-md-4 col-sm-12">
                                    <img src={event.poster} alt="event" className='poster'></img>
                                </FadeAnimation>
                                <div className="col-12 col-lg-8 col-md-8 col-sm-12">
                                    <FadeAnimation>
                                        <h1 className='aboutUs-subtitle'>{event.title}</h1>
                                    </FadeAnimation>
                                    <FadeAnimation animationDirection="fade-left" className='event-info'>
                                        <div className='event-date'>
                                            <i class="bi bi-calendar-date"></i> {formDate(event.event_date)}
                                        </div>
                                        <div className='event-time'>
                                            <i class="bi bi-clock"></i> {formTime(event.event_time)}
                                        </div>
                                        <div className='event-place'>
                                            <i className="bi bi-geo-alt-fill "></i> {event.place}
                                        </div>
                                    </FadeAnimation>
                                    <FadeAnimation className='event-description'>
                                        {event.description}

                                    </FadeAnimation>
                                    {isAdmin &&
                                        <button className="btn btn-nav login my-2" onClick={() => handleDeleteEvent(event.id)}>Vymazať akciu</button>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                }

                {pastEvents.length === 0 ? (
                    <></>
                ) : (
                    <>
                        <div className="container container-done">
                            <div className="title-events-done">
                                posledné akcie
                            </div>
                            {pastEvents.map(event => {
                                const galleryImages = event.images.map(img => `${img}`);

                                const mainImage = `${event.poster}`;

                                return (
                                    <div key={event.id} className="row event-row">
                                        <div className="col-12 col-lg-8 col-md-8 col-sm-12">
                                            <FadeAnimation>
                                                <h1 className='aboutUs-subtitle'>{event.title}</h1>
                                            </FadeAnimation>

                                            <div className='event-description'>
                                                {event.description}
                                            </div>

                                            <div className='row'>
                                                {(galleryImages).slice(0, 4).map((img, index) => (
                                                    <FadeAnimation
                                                        key={index}
                                                        animationDirection={index % 2 === 0 ? "fade-right" : "fade-up"}
                                                        delay={index % 2 === 0 ? 0 : 100}
                                                        className={`col-6 ${index < 2 ? 'py-4' : ''}`}
                                                    >
                                                        <img src={img} alt={`event ${index + 1}`} className='event-photo' />
                                                    </FadeAnimation>
                                                ))}
                                            </div>


                                        </div>

                                        <PosterLightbox
                                            mainImage={mainImage}
                                            galleryImages={galleryImages}
                                        />
                                        {isAdmin &&
                                            <div>
                                                <Link to={`/events/event-add-images/${event.id}`} className="btn btn-nav login my-2">
                                                    Pridať fotografie
                                                </Link>
                                            </div>
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>
        </>
    );
}

export default Events;