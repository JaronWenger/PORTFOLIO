import React, { forwardRef } from 'react';
import Odd from './Odd';
import Even from './Even'
import cinestokesite from '../assets/cinestokesite.webp';
import cinestokeicon from '../assets/cinestokeicon.png';
import takapicicon from '../assets/takapicicon.png';
import takapicsite from '../assets/takapicsite.webp';
import stocksite from '../assets/stocksite.webp';
import stockicon from '../assets/stocklookup.png';

const Applications = forwardRef(({ animationKey }, ref) => {
    return (
        <div className="applications" ref={ref} key={`apps-${animationKey}`}>
            <Odd 
                laptop={takapicsite}
                icon={takapicicon}
                title="takapic.com"
                revenue=""
                description="Transform your photos into cinematic AI-powered videos."
                visitLink="https://www.takapic.com"
                githubLink="https://github.com/JaronWenger/TAKAPIC"
                estDate="― EST. 1/2025 ―"
            />
            <Even 
                laptop={cinestokesite}
                icon={cinestokeicon}
                title="cinestoke.com"
                revenue=""
                description="Cinematic video and film production company."
                visitLink="https://www.cinestoke.com"
                githubLink="https://github.com/JaronWenger/CINESTOKE"
                estDate="― EST. 11/2024 ―"
            />
            <Odd 
                laptop={stocksite}
                icon={stockicon}
                title="Stock Lookup"
                revenue=""
                description="Compile a stock list revealing prices and daily moves."
                visitLink="https://jaronwenger.github.io/Stock-API/"
                githubLink="https://github.com/JaronWenger/Stock-API"
                estDate="― EST. 4/2024 ―"
            />
        </div>
    );
});

export default Applications; 