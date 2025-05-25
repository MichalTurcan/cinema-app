import "../style/contact.css";
import { Link } from "react-router-dom";
import ContactForm from "../components/ContactForm";
import FadeAnimation from "../animations/fade";

function Contact() {
    return (
        <>
            <div className="mt-4 p-5 header-AboutUs">
                <div className='header-AboutUs-text'>
                    <h1 className='header-AboutUs-title'>Kontakt</h1>
                    <div className='header-AboutUs-path'>
                        <Link className="header-AboutUs-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / Kontakt</p>
                    </div>

                </div>
            </div>

            <div className="container">
                <div className="title-about">
                    kontakt
                </div>

                <div className="row row-contact">
                    <div className="col-12 col-lg-6 col-md-6 col-sm-12">
                        <FadeAnimation>
                        <h1 className="aboutUs-subtitle">Spojte sa s nami</h1>
                        </FadeAnimation>
                        
                        <p>Ak máte nejaké otázky, poprípade by ste sa chceli pridať medzi nás, neváhajte nás kontaktovať prostredníctvom našich sociálnych sieti alebo nám napíšte pomocou kontakného formulára.</p>
                        <div className="row">
                            <div className="col-6 col-lg-6 col-md-12 col-sm-6 contact-col">
                                <i class="bi bi-telephone-fill"></i>
                                <FadeAnimation animationDirection="fade-left">
                                <p className="contact-info-title">Telefón</p>
                                <p className="contact-info-info">+421 944 388 279</p>
                                </FadeAnimation>
                            </div>
                            <div className="col-6 col-lg-6 col-md-12 col-sm-6 contact-col">
                            <i class="bi bi-envelope-fill"></i>
                                <FadeAnimation animationDirection="fade-left">
                                <p className="contact-info-title">Email</p>
                                <p className="contact-info-info">gama.uniza@gmail.com</p>
                                </FadeAnimation>
                            </div>
                            <div className="col-6 col-lg-6 col-md-12 col-sm-6 contact-col">
                            <i class="bi bi-globe2"></i>
                                <FadeAnimation animationDirection="fade-left">
                                <p className="contact-info-title">Web</p>
                                <p className="contact-info-info">gamaklub.uniza.sk</p>
                                </FadeAnimation>
                            </div>
                            <div className="col-6 col-lg-6 col-md-12 col-sm-6 contact-col">
                            <i className="bi bi-geo-alt-fill "> </i>
                                <FadeAnimation animationDirection="fade-left">
                                <p className="contact-info-title">Adresa</p>
                                <p className="contact-info-info">Internáty VD, blok G-H</p>
                                </FadeAnimation>
                            </div>
                        </div>
                        <FadeAnimation>
                            <h1 className="aboutUs-subtitle" style={{fontSize: "35px", marginTop: "20px"}}>naše sociálne siete</h1>
                        </FadeAnimation>
                        
                        <div className="socials-row socials-row-contact" style={{marginTop: "-10px"}}>
                            <a href="http://instagram.com/" className="instagram instagram-contact" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-instagram"></i>
                            </a>
                            <a href="http://facebook.com/" className="facebook facebook-contact" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-facebook"></i>
                            </a>
                        </div>
                    </div>
                    <FadeAnimation className="col-12 col-lg-6 col-md-6 col-sm-12">
                        <ContactForm />
                    </FadeAnimation>
                </div>
            </div>

            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.5620651145914!2d18.75701187715804!3d49.20886677138186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471459a08d58dd55%3A0x4c3f3f2394e0719c!2sGama%20Klub!5e0!3m2!1ssk!2ssk!4v1740071727069!5m2!1ssk!2ssk" width="600" height="450" allowfullscreen="" loading="lazy" title="Map" referrerpolicy="no-referrer-when-downgrade" className="contact-map"></iframe>
        </>
    );
}

export default Contact;