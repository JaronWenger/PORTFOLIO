import { useEffect, useState, useRef } from 'react';
import jaronwenger from "../assets/jaronwenger.webp";
import software from "../assets/software.webp";
import projectsImg from '../assets/projects.webp';
import brdImg from '../assets/brd.webp';
import contactImg from '../assets/contact.webp';
import Applications from './Applications';
import Links from './Links';

const Hero = () => {
    const [key, setKey] = useState(0);
    const applicationsRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const fixedBrd = document.querySelector('.fixed-brd');
            if (window.scrollY > 100) {
                fixedBrd?.classList.add('visible');
            } else {
                fixedBrd?.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    const scrollToApplications = () => {
        if (applicationsRef.current) {
            const windowHeight = window.innerHeight;
            const appPosition = applicationsRef.current.getBoundingClientRect().top + window.scrollY;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (appPosition + windowHeight > documentHeight) {
                window.scrollTo({
                    top: documentHeight,
                    behavior: 'smooth'
                });
            } else {
                applicationsRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const triggerAnimation = () => {
        setKey(prev => prev + 1);
    };

    return (
        <>
            <img 
                src={brdImg} 
                alt="BRD" 
                className="fixed-brd" 
                onClick={scrollToTop}
            />
            <div className="hero">
                <div className="control-bar" key={`bar-${key}`}>
                    <img 
                        src={projectsImg} 
                        alt="Projects" 
                        onClick={scrollToApplications}
                        style={{ cursor: 'pointer' }}
                    />
                    <img 
                        src={brdImg} 
                        alt="BRD" 
                        onClick={triggerAnimation}
                    />
                    <img 
                        src={contactImg} 
                        alt="Contact" 
                        onClick={scrollToBottom}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <img 
                    src={jaronwenger} 
                    alt="Jaron Wenger" 
                    className="main-image"
                    key={`main-${key}`}
                />
                <img 
                    src={software} 
                    alt="Software" 
                    className="sub-image"
                    key={`sub-${key}`}
                />
                <Applications animationKey={key} ref={applicationsRef} />
                <Links animationKey={key} />
            </div>
        </>
    );
};

export default Hero;