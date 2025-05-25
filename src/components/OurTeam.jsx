import "../style/team.css";
import { Link } from "react-router-dom";
import FadeAnimation from "../animations/fade";

import { LanguageContext } from '../context/LenguageContext';
import { useContext } from 'react';

import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

function Team() {
    const { language } = useContext(LanguageContext);

    const content = {
        en: {
            title: "team",
            leader: "Leader",
            tech: "Head of technology",
            graphics: "Head of graphics",
            public: "Head of public procurement",
            button: "Meet the whole team"

        },
        sk: {
            title: "tím",
            leader: "Vedúci",
            tech: "Vedúci techniky",
            graphics: "Vedúci grafiky",
            public: "Vedúci VO",
            button: "Spoznajte celý tím"

        }
    };


    const [leaders, setLeaders] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const roleIds = [4, 2, 3, 1]; 
                const response = await axios.get(`/api/leaders`, {
                    params: { roleIds: roleIds.join(",") }
                });

                console.log(response.data);

                setLeaders(response.data.data); 
            } catch (err) {
                console.error("❌ Chyba pri načítaní lídrov:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    if (loading) return <p>Načítavam...</p>;

    return (
        <section id="team">
            <div className="container">
                <div className="title-team">
                    {content[language].title}
                </div>
            </div>
            <div className="container-fluid ">

                <div className="row">

                    {leaders.map((leader) => (

                        <FadeAnimation animationDirection="fade-up" distance="100px" delay={50} duration={1000} className="col-6 col-lg-3 col-md-6 col-sm-6 d-flex justify-content-center">
                            <div className="card our-team-card " style={{
                                backgroundImage: `url(${leader.imageLocation})`
                            }}>
                                <div className="card-body card-body-team">
                                    <div className="card-title card-title-team">{leader.name}</div>
                                    <div className="card-text">{leader.role}</div>
                                    <div className="socials-row">
                                    {leader.instagram ? 
                                        <a href={leader.instagram} className="instagram" target="_blank" rel="noopener noreferrer">
                                            <i class="bi bi-instagram"></i>
                                        </a>
                                         : ""}
                                        <a href={`mailto: ${leader.email}`} className="mail" target="_blank" rel="noopener noreferrer">
                                            <i class="bi bi-envelope-fill"></i>
                                        </a>
                                    {leader.facebook ? 
                                        <a href={leader.facebook}  className="facebook" target="_blank" rel="noopener noreferrer">
                                            <i class="bi bi-facebook"></i>
                                        </a>
                                    : ""}
                                    </div>
                                </div>
                            </div>
                        </FadeAnimation>
                    ))}
                </div>

            </div>
            <div className="fullteam-btn">
                <Link className="btn btn-outline-light btn-lg m-2 btn-team " to="/fullteam">{content[language].button}</Link>
            </div>



        </section>
    );
}

export default Team;