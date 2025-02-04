import React from 'react';
import githubIcon from '../assets/github.svg';
import linkedinIcon from '../assets/linkedin.svg';
import emailIcon from '../assets/email.svg';

const Links = ({ animationKey }) => {
    return (
        <div className="links-container" key={`links-${animationKey}`}>
            <a 
                href="https://github.com/JaronWenger"
                target="_blank"
                rel="noopener noreferrer"
                className="link-button"
            >
                <img src={githubIcon} alt="GitHub" className="link-icon" />
            </a>
            <a 
                href="https://www.linkedin.com/in/jaronwenger/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-button"
            >
                <img src={linkedinIcon} alt="LinkedIn" className="link-icon" />
            </a>
            <a 
                href="mailto:jarongwenger@gmail.com?subject=Portfolio Contact"
                className="link-button"
            >
                <img src={emailIcon} alt="Email" className="link-icon" />
            </a>
        </div>
    );
};

export default Links; 