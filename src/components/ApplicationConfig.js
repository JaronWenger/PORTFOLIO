import stocksite from '../assets/stocksite.webp';
import stockicon from '../assets/stocklookup.webp';
import cinestoke from '../assets/cinestoke.webp';
import cinestokeicon from '../assets/cinestokeicon.webp';
import takapicsite from '../assets/takapicsite.webp';
import takapicicon from '../assets/takapicicon.webp';
import codasite from '../assets/CODAMAC.webp';
import codaicon from '../assets/codaicon2.webp';
import tenminutesfromhellicon from '../assets/tenminutesfromhellicon.webp';
import tenminutesfromhelliphone from '../assets/tenminutesfromhelliphone.webp';
import espanolicon from '../assets/EspanolIcon.webp';
import espanoliphone from '../assets/EspanolPhone.webp';
import jimmy from '../assets/jimmy.webp';
import jimmyicon from '../assets/jimmyicon.webp';
import expeditionatlas from '../assets/expeditionatlas.webp';
import expeditionatlasicon from '../assets/expeditionatlasicon.webp';

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
        screenshot: cinestoke,
        icon: cinestokeicon,
        title: "CINESTOKE",
        revenue: "",
        description: "Cinematic video and film production company.",
        visitLink: "https://www.cinestoke.com",
        githubLink: "",
        simpleAnalyticsLink: "https://dashboard.simpleanalytics.com/cinestoke.com",
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
        simpleAnalyticsLink: "",
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
        iphone: tenminutesfromhelliphone,
        icon: tenminutesfromhellicon,
        title: "HIITem",
        revenue: "",
        description: "The only timer your workout needs.",
        visitLink: "https://www.hiitem.com",
        githubLink: "https://github.com/JaronWenger/tenminutesfromhell",
        estDate: "― EST. 8/2025 ―"
    },
    {
        iphone: espanoliphone,
        icon: espanolicon,
        title: "Sing Espańol",
        revenue: "",
        description: "Learn Spanish through music and English Translations.",
        visitLink: "https://jaronwenger.github.io/ESPANOL/",
        githubLink: "https://github.com/JaronWenger/ESPANOL",
        estDate: "― EST. 5/2026 ―"
    },
    {
        screenshot: jimmy,
        icon: jimmyicon,
        title: "Jimmy Boof",
        revenue: "",
        description: "Paddle open-world rivers in this kayaking simulator.",
        visitLink: "https://jimmyboof.com",
        githubLink: "",
        simpleAnalyticsLink: "https://dashboard.simpleanalytics.com/jimmyboof.com",
        estDate: "― EST. 8/2026 ―"
    },
    {
        screenshot: expeditionatlas,
        icon: expeditionatlasicon,
        title: "Expedition Atlas",
        revenue: "",
        description: "A collection of the greatest expeditions on earth.",
        visitLink: "https://theexpeditionatlas.com",
        githubLink: "",
        simpleAnalyticsLink: "",
        estDate: "― EST. 10/2026 ―"
    },
];
