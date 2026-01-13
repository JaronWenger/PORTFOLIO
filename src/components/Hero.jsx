import { useEffect, useState, useRef } from 'react';
import jaronwenger from "../assets/jaronwenger.webp";
import portfolio from "../assets/portfolio.webp";
import projectsImg from '../assets/projects.webp';
import brdImg from '../assets/brd.webp';
import contactImg from '../assets/contact.webp';
import Applications from './Applications';
import Links from './Links';
import { projects } from './ApplicationConfig';

const Hero = () => {
    const [key, setKey] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const applicationsRef = useRef(null);
    const projectRefs = useRef([]);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-close menu on scroll
    useEffect(() => {
        if (isMenuOpen) {
            const handleScroll = () => setIsMenuOpen(false);
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [isMenuOpen]);

    // Auto-close menu on outside click
    useEffect(() => {
        if (isMenuOpen) {
            const handleClickOutside = (e) => {
                if (!e.target.closest('.fixed-logo-container')) {
                    setIsMenuOpen(false);
                }
            };
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    const scrollToProject = (index) => {
        setIsMenuOpen(false);
        const ref = projectRefs.current[index];
        if (ref) {
            const offset = window.innerWidth < 768 ? 80 : 120;
            const position = ref.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: Math.max(0, position - offset),
                behavior: 'smooth'
            });
        }
    };

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
            const offset = window.innerWidth < 768 ? 20 : 50; // Reduced offset to show more of the project
            
            if (appPosition + windowHeight > documentHeight) {
                window.scrollTo({
                    top: documentHeight - windowHeight,
                    behavior: 'smooth'
                });
            } else {
                window.scrollTo({
                    top: Math.max(0, appPosition - offset), // Smaller offset means project will be higher
                    behavior: 'smooth'
                });
            }
        }
    };

    const triggerAnimation = () => {
        setKey(prev => prev + 1);
    };

    // Reversed projects for dropdown (newest first)
    const displayProjects = [...projects].reverse();

    return (
        <>
            <div
                className={`fixed-logo-container ${isScrolled ? 'visible' : ''}`}
            >
                <img
                    src={brdImg}
                    alt="BRD"
                    className="fixed-brd"
                    onClick={toggleMenu}
                    onDoubleClick={scrollToTop}
                />
                <div className={`project-icons-dropdown ${isMenuOpen ? 'open' : 'closed'}`}>
                    {displayProjects.map((project, index) => (
                        <img
                            key={project.title}
                            src={project.icon}
                            alt={project.title}
                            className="dropdown-icon"
                            onClick={() => scrollToProject(index)}
                        />
                    ))}
                </div>
            </div>
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
                    src={portfolio}
                    alt="Portfolio"
                    className="sub-image"
                    key={`sub-${key}`}
                />
                <Applications animationKey={key} ref={applicationsRef} projectRefs={projectRefs} />
                <Links animationKey={key} />
            </div>
        </>
    );
};

export default Hero;