import stocksite from '../assets/stocksite.webp';
import stockicon from '../assets/stocklookup.png';
import cinestokesite from '../assets/cinestokesite.webp';
import cinestokeicon from '../assets/cinestokeicon.png';
import takapicsite from '../assets/takapicsite.webp';
import takapicicon from '../assets/takapicicon.png';
import codasite from '../assets/CODAMAC.webp';
import codaicon from '../assets/codaicon2.png';
import tenminutesfromhellsite from '../assets/tenminutesfromhell.webp';
import tenminutesfromhellicon from '../assets/tenminutesfromhell.png';

// Projects ordered oldest → newest
// Index 0 (oldest) renders as Odd, index 1 as Even, etc.
export const projects = [
    {
        laptop: stocksite,
        icon: stockicon,
        title: "Stock Lookup",
        revenue: "",
        description: "Compile a stock list revealing prices and daily moves.",
        visitLink: "https://jaronwenger.github.io/Stock-API/",
        githubLink: "https://github.com/JaronWenger/Stock-API",
        estDate: "― EST. 4/2024 ―"
    },
    {
        laptop: cinestokesite,
        icon: cinestokeicon,
        title: "cinestoke.com",
        revenue: "$500/m",
        description: "Cinematic video and film production company.",
        visitLink: "https://www.cinestoke.com",
        githubLink: "https://github.com/JaronWenger/CINESTOKE",
        estDate: "― EST. 11/2024 ―"
    },
    {
        laptop: takapicsite,
        icon: takapicicon,
        title: "takapic.com",
        revenue: "",
        description: "Transform your photos into cinematic AI-powered videos.",
        visitLink: "https://www.takapic.com",
        githubLink: "https://github.com/JaronWenger/TAKAPIC",
        estDate: "― EST. 1/2025 ―"
    },
    {
        laptop: codasite,
        icon: codaicon,
        title: "Coda Link",
        revenue: "",
        description: "Connect & edit your Coda tables with an API.",
        visitLink: "",
        githubLink: "https://github.com/JaronWenger/CODAAPI",
        estDate: "― EST. 5/2025 ―"
    },
    {
        laptop: tenminutesfromhellsite,
        icon: tenminutesfromhellicon,
        title: "Ten Minutes From Hell",
        revenue: "",
        description: "The only timer your workout needs.",
        visitLink: "https://www.tenminutesfromhell.com",
        githubLink: "https://github.com/JaronWenger/tenminutesfromhell",
        estDate: "― EST. 8/2025 ―"
    },
];
