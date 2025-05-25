import { useState, useEffect, useRef} from "react";

const FadeAnimation = ({
    children,
    animationDirection = "fade-up",
    delay = 0,
    threshold = 0.3,
    duration = 800,
    distance = "30px",
    className = ""
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                setIsVisible(true);
            }
        }, {
            threshold: threshold
        });

        const currentRef = elementRef.current;

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold]);

    const getAnimationStyle = () => {
        let translateX = "0";
        let translateY = "0";

        if (animationDirection === "fade-up") {
            translateY = `${distance}`;
        } else if (animationDirection === "fade-down") {
            translateY = `-${distance}`;
        } else if (animationDirection === "fade-left") {
            translateX = `${distance}`;
        } else if (animationDirection === "fade-right") {
            translateX = `-${distance}`;
        }

        const styles = {
            transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
            transitionDelay: `${delay}ms`,
            opacity: isVisible ? 1 : 0,
            transform: isVisible
                ? "translate(0, 0)"
                : `translate(${translateX}, ${translateY})`,
        };

        return styles;
    };

    return (
        <div
            ref={elementRef}
            className={className}
            style={getAnimationStyle()}
        >
            {children}
        </div>
    );
};

export default FadeAnimation;