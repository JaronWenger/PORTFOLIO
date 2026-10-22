import React, { useState } from 'react';
import githubIcon from '../assets/github.svg';
import linkedinIcon from '../assets/linkedin.svg';
import emailIcon from '../assets/email.svg';

const EMAIL = 'jarongwenger@gmail.com';

const Links = ({ animationKey }) => {
    const [copied, setCopied] = useState(false);
    const openLink = (url) => window.open(url, '_blank', 'noopener,noreferrer');
    // mailto does nothing when no mail app is set up, so also copy the address
    const openEmail = () => {
        navigator.clipboard?.writeText(EMAIL).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Portfolio Contact')}`;
    };

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
                className="link-button email-button"
            >
                <img src={emailIcon} alt="Email" className="link-icon" />
                <span className={`email-copied ${copied ? 'visible' : ''}`}>Email copied</span>
            </button>
        </div>
    );
};

export default Links;
