import React, { useState, useEffect } from 'react';
import "../style/events.css";

const PosterLightbox = ({
    mainImage,
    galleryImages,

}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            setTimeout(() => setIsOpen(false), 300);
        }
    }, [isOpen]);


    return (
        <>
            <div
                className={`col-12 col-lg-4 col-md-4 col-sm-12 poster-done-more`}
                style={{
                    backgroundImage: `url(${mainImage})`
                }}
            >
                <div onClick={() => setIsOpen(true)}>
                    <i className="bi bi-arrow-right-circle"></i>
                </div>
            </div>

            {isOpen && (

                <div className={`lightbox ${isVisible ? "open" : ""}`} onClick={(e) => {
                    if (e.target === e.currentTarget) setIsOpen(false);
                }}>
                    <div className="lightbox-content">

                        <button
                            onClick={() => setIsOpen(false)}
                            className="lightbox-close"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>


                        <img src={galleryImages[currentImageIndex]} alt={`Gallery ${currentImageIndex + 1}`} />


                        {galleryImages.length > 1 && (
                            <>
                                <button onClick={previousImage} className="lightbox-prev">
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <button onClick={nextImage} className="lightbox-next">
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </>
                        )}


                        <div className="lightbox-indicator">
                            {currentImageIndex + 1} / {galleryImages.length}
                        </div>
                    </div>
                </div>

            )}
        </>
    );
};

export default PosterLightbox;