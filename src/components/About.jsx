import "../style/about.css";
import { Link } from "react-router-dom";
import AnimatedCounter from "../animations/counter";
import FadeAnimation from "../animations/fade";

import { LanguageContext } from '../context/LenguageContext';
import { useContext } from 'react';

function About() {
    const { language } = useContext(LanguageContext);

    const content = {
        en: {
            title: "about us",
            dot: "th",
            years: "year at",
            heading: "what does the gama club do?",
            desc: "Nowdays, Gama Klub mainly concentrates on movie projection. Students have the opportunity to relax with the latest movies as well as classics up to three times a week. The Gama is also often used for various conferences and events organized by the university and its faculties or for conferences from external non-university companies and organizations.",
            card1: "projection",
            card2: "events",
            card3: "cinema hall rental",
            button: "More about us"
        },
        sk: {
            title: "o nás",
            dot: ".",
            years: "rok",
            heading: "Čím sa zaoberá gama klub?",
            desc: "Gama Klub sa už v dnešnej dobe koncentruje najmä na premietanie filmov. Študenti majú možnosť zrelaxovať pri najnovších filmových novinkách ale aj klasikách až trikrát do týždňa. Priestory Gamy sa častokrát využívajú aj na rôzne konferencie a podujatia usporiadávané univerzitou a jej fakultami alebo pre konferencie z externých mimouniverzitných firiem a organizácii.",
            card1: "premietanie",
            card2: "akcie",
            card3: "prenájom sály",
            button: "Viac o nás"
        }
    };

    return (
        <section id="about">
            <div className="container" >
                <div className="title-about">
                    {content[language].title}
                </div>
                <div className="row">
                    <div className="col-12 col-lg-7 col-md-12 ">
                        <FadeAnimation animationDirection="fade-right" className="row images">
                            <div className="col">
                                <img src="/img/about_us_1.jpg" alt="img1" className="img1" ></img>
                                <div className="aboutUs-numbers-first-row">
                                    <AnimatedCounter targetNumber={29} duration={3000} />
                                    <article className="aboutUs-number-second">{content[language].dot}</article>
                                </div>

                                <article className="aboutUs-numbers-second-row">{content[language].years} NA UNIZA</article>
                            </div>

                            <div className="col img-col">
                                <img src="/img/about_us_2.jpg" alt="img2" className="img2" ></img>
                            </div>
                        </FadeAnimation >

                    </div>
                    <div className="col-12 col-lg-5 col-md-12 order-md-2 order-lg-2 order-2 img-center">
                        <FadeAnimation animationDirection="fade-up">
                            <p className="about-us-title">{content[language].heading}</p>
                        </FadeAnimation>
                        <p className="about-us-text">{content[language].desc}</p>


                        <FadeAnimation animationDirection="fade-up" className="row about-us-sections-row">
                            <div className="col-12 col-lg-4 col-md-12 col-sm-12 about-us-sections mx-2">
                                <i class="bi bi-film about-us-icon"></i>
                                <p className="about-us-icon-text">{content[language].card1}</p>
                            </div>

                            <div className="col-12 col-lg-4 col-sm-12 about-us-sections mx-2">
                                <i class="bi bi-calendar-event about-us-icon"></i>
                                <p className="about-us-icon-text">{content[language].card2}</p>
                            </div>

                            <div className="col-12 col-lg-4 col-sm-12 about-us-sections mx-2">
                                <i class="bi bi-cash-coin about-us-icon"></i>
                                <p className="about-us-icon-text">{content[language].card3}</p>
                            </div>
                        </FadeAnimation>

                        <Link className="btn btn-outline-light btn-lg m-2 btn-about-us"
                            to="/aboutus"
                            rel="noopener noreferrer">
                            {content[language].button}
                        </Link>

                    </div>

                </div>
            </div>
        </section>
    );
}

export default About;