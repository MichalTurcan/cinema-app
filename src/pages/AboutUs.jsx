import "../style/aboutUs.css";
import { Link } from "react-router-dom";
import AnimatedCounter from "../animations/counter";
import FadeAnimation from "../animations/fade";


import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

function AboutUs() {

    const [leaders, setLeaders] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const roleIds = [4, 2, 3, 1]; 
                const response = await axios.get(`http://localhost:5001/api/leaders`, {
                    params: { roleIds: roleIds.join(",") }
                });

                setLeaders(response.data.data); 
            } catch (err) {
                console.error("Chyba pri načítaní lídrov:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    if (loading) return <p>Načítavam...</p>;


    return (
        <>
            <div className="mt-4 p-5 header-AboutUs">
                <div className='header-AboutUs-text'>
                    <h1 className='header-AboutUs-title'>O nás</h1>
                    <div className='header-AboutUs-path'>
                        <Link className="header-AboutUs-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / O nás</p>
                    </div>

                </div>

            </div>

            <div className="container">
                <div className="title-about">
                    o nás
                </div>
                <FadeAnimation animationDirection="fade-up" className="row ">
                    <img src="/img/car_1.jpeg" alt="img" className="img-aboutUs"></img>
                </FadeAnimation>

                <div className="row aboutUs-row">
                    <FadeAnimation animationDirection="fade-up" className="col-12 col-lg-6 col-md-8 col-sm-12">
                        <h1 className="aboutUs-subtitle">Začiatky Gama Klubu</h1>
                        <p>GamaKlub je študentskou organizáciou Žilinskej univerzity v Žiline. Za jeho vznikom stojí študentská skupina, ktorá sa približne v roku 1996 so zápalom a entuziazmom rozhodla založiť kultúrnu ustanovizeň. Cieľom bolo podporiť duchovnú a kultúrnu osvetu na pôde univerzity. Zo začiatku bolo technické vybavenie neporovnateľne slabšie ako je dnes, keďže sa Gama sústredila najmä na divadelné predstavenia, o čom svedčí aj divadelná technika, ktorá je stále vo veľkej miere stálicou technického vybavenia GAMA klubu.</p>
                        <p>Prienikom modernej techniky do bežného života, sa GAMA postarala o moderné vybavenie divadelnej haly. Zakúpením video prehrávača, projektora a množstva ďalších moderných sa zrodila dnešná, namakaná verzia GAMA klubu.</p>
                    </FadeAnimation>
                    <FadeAnimation animationDirection="fade-left" delay={300} className="col-12 col-lg-6 col-md-4 col-sm-12 col-logo">
                        <img src="/img/Logo_Horizontal_Light.svg" alt="img" className="aboutUs-logo"></img>
                    </FadeAnimation>
                </div>

                <div className="row aboutUs-row">

                    <FadeAnimation animationDirection="fade-right" delay={300} className="col-12 col-lg-4 col-md-4 col-sm-12 order-lg-1 order-md-1 order-sm-2">
                        <img src="/img/car_2.jpeg" alt="img" className="aboutUs-img"></img>
                    </FadeAnimation>
                    <FadeAnimation animationDirection="fade-up" className="col-12 col-lg-8 col-md-8 col-sm-12 order-lg-2 order-md-2 order-sm-1">
                        <h1 className="aboutUs-subtitle">Súčastnosť</h1>
                        <p>Gama držala krok s dobou. Zakúpením modernej techniky sa zmenilo aj hlavné poslanie GamaKlubu. Divadelnú éru, ktorá síce naďalej slúži ako doplnková zábava študentov, nahradila filmová vášeň študentov a členov Gamy. Aj vďaka tomu sa dnes GamaKlub koncentruje najmä na premietanie filmov. Študenti majú možnosť zrelaxovať pri najnovších filmových novinkách ale aj klasikách až trikrát do týždňa. Priestory Gamy sa častokrát využívajú aj na rôzne konferencie a podujatia usporiadávané univerzitou a jej fakultami alebo pre konferencie z externých mimouniverzitných firiem a organizácii.</p>

                    </FadeAnimation>
                </div>
                
                
                <div className="row aboutUs-row">

                    <div className="col-12 col-lg-3 col-md-6 col-sm-12 aboutUs-numbers">
                        <div className="aboutUs-numbers-first-row">
                            <AnimatedCounter targetNumber={29} />
                            <article className="aboutUs-number-second">.</article>
                        </div>

                        <article className="aboutUs-numbers-second-row">ROK NA UNIZA</article>
                    </div>
                    <div className="col-12 col-lg-3 col-md-6 col-sm-12 aboutUs-numbers">
                        <div className="aboutUs-numbers-first-row">
                            <AnimatedCounter targetNumber={182} duration={2000}/>
                            <article className="aboutUs-number-second">MIEST</article>
                        </div>

                        <article className="aboutUs-numbers-second-row">NA SEDENIE</article>
                    </div>
                    <div className="col-12 col-lg-3 col-md-6 col-sm-12 aboutUs-numbers">
                        <div className="aboutUs-numbers-first-row">
                            <AnimatedCounter targetNumber={3} />
                            <article className="aboutUs-number-second">FILMY</article>
                        </div>

                        <article className="aboutUs-numbers-second-row">KAŽDÝ TÝŽDEŇ</article>
                    </div>
                    <div className="col-12 col-lg-3 col-md-6 col-sm-12 aboutUs-numbers">
                        <div className="aboutUs-numbers-first-row">
                            <AnimatedCounter targetNumber={2} />
                            <article className="aboutUs-number-second">+</article>
                        </div>

                        <article className="aboutUs-numbers-second-row">AKCIE ZA SEMESTER</article>
                    </div>

                </div>


            </div>

            <div className="container">
                <div className="title-movies">
                    tím
                </div>
                <FadeAnimation>
                    <h1 className="aboutUs-subtitle" style={{ textAlign: "right" }}>Náš vedúci tím</h1>
                </FadeAnimation>
                <div className="row">
                    {leaders[0] && 
                    <FadeAnimation className="col-12 col-lg-3 col-md-6 col-sm-12">
                        <div className="card card-leader-team">
                            <img className="card-img-top card-img-aboutUs" src={leaders[0].imageLocation} alt="Profile"></img>
                            <div className="card-body card-leader-team-body">
                                <h2 className="card-title-aboutUs">{leaders[0].name}</h2>
                                {leaders[0].role === "Vedúci" ? (
                                    <p className="card-text-aboutUs">Vedúci</p>
                                ) : (
                                    <p className="card-text-aboutUs">Vedúci - {leaders[0].role}</p>
                                )}
                                <div className="socials-row  aboutUs-socials">
                                    {leaders[0].instagram ? 
                                    <a href={leaders[0].instagram} className="instagram instagram-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-instagram"></i>
                                    </a>
                                    : ""}
                                    <a href={`mailto: ${leaders[0].email}`} className="mail mail-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-envelope-fill"></i>
                                    </a>
                                    {leaders[0].facebook ? 
                                    <a href={leaders[0].facebook} className="facebook facebook-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-facebook"></i>
                                    </a>
                                    : ""}
                                </div>
                            </div>
                        </div>
                    </FadeAnimation>
                    }
                    {leaders[1] && 
                    <FadeAnimation delay={300} className="col-12 col-lg-3 col-md-6 col-sm-12">
                        <div className="card card-leader-team">
                        <img className="card-img-top card-img-aboutUs" src={leaders[1].imageLocation} alt="Profile"></img>
                            <div className="card-body card-leader-team-body">
                                <h2 className="card-title-aboutUs">{leaders[1].name}</h2>
                                {leaders[1].role === "Vedúci" ? (
                                    <p className="card-text-aboutUs">Vedúci</p>
                                ) : (
                                    <p className="card-text-aboutUs">Vedúci - {leaders[1].role}</p>
                                )}
                                
                                <div className="socials-row  aboutUs-socials">
                                    {leaders[1].instagram ? 
                                    <a href={leaders[1].instagram} className="instagram instagram-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-instagram"></i>
                                    </a>
                                    : ""}
                                    <a href={`mailto: ${leaders[1].email}`} className="mail mail-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-envelope-fill"></i>
                                    </a>
                                    {leaders[1].facebook ? 
                                    <a href={leaders[1].facebook} className="facebook facebook-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-facebook"></i>
                                    </a>
                                    : ""}
                                </div>
                            </div>
                        </div>
                    </FadeAnimation>
                    }
                    {leaders[2] && 
                    <FadeAnimation delay={600} className="col-12 col-lg-3 col-md-6 col-sm-12">
                        <div className="card card-leader-team">
                        <img className="card-img-top card-img-aboutUs" src={leaders[2].imageLocation} alt="Profile"></img>
                            <div className="card-body card-leader-team-body">
                                <h2 className="card-title-aboutUs">{leaders[2].name}</h2>
                                {leaders[2].role === "Vedúci" ? (
                                    <p className="card-text-aboutUs">Vedúci</p>
                                ) : (
                                    <p className="card-text-aboutUs">Vedúci - {leaders[2].role}</p>
                                )}
                                <div className="socials-row  aboutUs-socials">
                                    {leaders[2].instagram ? 
                                    <a href={leaders[2].instagram} className="instagram instagram-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-instagram"></i>
                                    </a>
                                    : ""}
                                    <a href={`mailto: ${leaders[2].email}`} className="mail mail-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-envelope-fill"></i>
                                    </a>
                                    {leaders[2].facebook ? 
                                    <a href={leaders[2].facebook} className="facebook facebook-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-facebook"></i>
                                    </a>
                                    : ""}
                                </div>
                            </div>
                        </div>
                    </FadeAnimation>
                    }
                    {leaders[3] && 
                    <FadeAnimation delay={900} className="col-12 col-lg-3 col-md-6 col-sm-12">
                        <div className="card card-leader-team">
                        <img className="card-img-top card-img-aboutUs" src={leaders[3].imageLocation} alt="Profile"></img>
                            <div className="card-body card-leader-team-body">
                                <h2 className="card-title-aboutUs">{leaders[3].name}</h2>
                                {leaders[3].role === "Vedúci" ? (
                                    <p className="card-text-aboutUs">Vedúci</p>
                                ) : (
                                    <p className="card-text-aboutUs">Vedúci - {leaders[3].role}</p>
                                )}
                                <div className="socials-row  aboutUs-socials">
                                    {leaders[3].instagram ? 
                                    <a href={leaders[3].instagram} className="instagram instagram-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-instagram"></i>
                                    </a>
                                    : ""}
                                    <a href={`mailto: ${leaders[3].email}`} className="mail mail-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-envelope-fill"></i>
                                    </a>
                                    {leaders[3].facebook ? 
                                    <a href={leaders[3].facebook} className="facebook facebook-contact" target="_blank" rel="noopener noreferrer">
                                        <i class="bi bi-facebook"></i>
                                    </a>
                                    : ""}
                                </div>
                            </div>
                        </div>
                    </FadeAnimation>
                    }
                    <div className="fullteam-btn fullteam-btn-aboutUs">
                        <Link className="btn btn-outline-light btn-lg m-2 btn-team " to="/fullteam">Spoznaj celý tím</Link>
                    </div>
                </div>
            </div>

        </>
    );
}

export default AboutUs;