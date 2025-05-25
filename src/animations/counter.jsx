import { useState, useEffect, useRef } from "react";

const AnimatedCounter = ({ targetNumber, duration = 1500 }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const counterRef = useRef(null);
    const animationStarted = useRef(false);


    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                setIsVisible(true);
            }
        }, {
            threshold: 0.3
        });


        const currentRef = counterRef.current;

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible || animationStarted.current) return;

        animationStarted.current = true;

        let startTime;
        let animationFrameId;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            const percentage = Math.min(progress / duration, 1);
            const currentCount = Math.floor(percentage * targetNumber);

            setCount(currentCount);

            if (percentage < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(targetNumber);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isVisible, targetNumber, duration]);

    return (
        <article className="aboutUs-number-first" ref={counterRef}>{count}</article>
    );
};

export default AnimatedCounter;