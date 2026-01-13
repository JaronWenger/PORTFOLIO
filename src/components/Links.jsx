import React from 'react';
import githubIcon from '../assets/github.svg';
import linkedinIcon from '../assets/linkedin.svg';
import emailIcon from '../assets/email.svg';

const Links = ({ animationKey }) => {
    const openLink = (url) => window.open(url, '_blank', 'noopener,noreferrer');
    const openEmail = () => window.location.href = 'mailto:jarongwenger@gmail.com?subject=Portfolio Contact';

    return (
        <div className="links-container" key={`links-${animationKey}`}>
            <button
                onClick={() => openLink('https://github.com/JaronWenger')}
                className="link-button"
            >
                <img src={githubIcon} alt="GitHub" className="link-icon" />
            </button>
            <button
                onClick={() => openLink('https://www.linkedin.com/in/jaronwenger/')}
                className="link-button"
            >
                <img src={linkedinIcon} alt="LinkedIn" className="link-icon" />
            </button>
            <button
                onClick={openEmail}
                className="link-button"
            >
                <img src={emailIcon} alt="Email" className="link-icon" />
            </button>
        </div>
    );
};

export default Links;
