import React, { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import Odd from './Odd';
import Even from './Even';
import { projects } from './ApplicationConfig';

// Beam strength from how far a project's centre is from the middle of the
// screen. Measured in project heights, the centred project is fully lit and the
// next one over glows at ~25% (gone two away); measured in screen heights, it
// fades to nothing before the top / bottom edge. The weaker of the two wins.
const strengthFrom = (distance, size, full, fade) =>
    Math.min(1, Math.max(0, 1 - (distance - full * size) / (fade * size)));

const Applications = forwardRef(({ animationKey, projectRefs }, ref) => {
    // Reverse to show newest first on site
    const displayProjects = [...projects].reverse();
    const appsRef = useRef(null);
    const layerRef = useRef(null);
    const slotRefs = useRef([]);
    const beamRefs = useRef([]);
    const [beamTops, setBeamTops] = useState([]);

    const setAppsRef = (el) => {
        appsRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
    };

    // Beams live in a layer behind the whole hero (so they're never clipped by
    // .applications), positioned at each project's centre. Re-measure whenever
    // the list changes size (lazy images, resize), and set each beam's
    // strength (--beam, 0–1) on every scroll frame.
    useLayoutEffect(() => {
        const apps = appsRef.current;
        const layer = layerRef.current;
        if (!apps || !layer) return;

        const measure = () => {
            const layerTop = layer.getBoundingClientRect().top;
            setBeamTops(slotRefs.current.map(el => {
                if (!el) return 0;
                const rect = el.getBoundingClientRect();
                return rect.top - layerTop + rect.height / 2;
            }));
        };

        let frame = null;
        const updateStrength = () => {
            frame = null;
            const vh = window.innerHeight;
            slotRefs.current.forEach((slot, i) => {
                const beam = beamRefs.current[i];
                if (!slot || !beam) return;
                const rect = slot.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - vh / 2);
                const strength = Math.min(
                    strengthFrom(distance, rect.height, 0.1, 1.2),
                    strengthFrom(distance, vh, 0.06, 0.44)
                );
                beam.style.setProperty('--beam', strength.toFixed(3));
            });
        };
        const scheduleStrength = () => {
            if (!frame) frame = requestAnimationFrame(updateStrength);
        };

        measure();
        updateStrength();
        const observer = new ResizeObserver(() => { measure(); scheduleStrength(); });
        observer.observe(apps);
        observer.observe(apps.parentElement); // title above can change height (font load)
        window.addEventListener('scroll', scheduleStrength, { passive: true });
        window.addEventListener('resize', scheduleStrength);
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', scheduleStrength);
            window.removeEventListener('resize', scheduleStrength);
            cancelAnimationFrame(frame);
        };
    }, [animationKey]);

    return (
        <>
            <div className="spotlights" ref={layerRef} aria-hidden="true">
                {displayProjects.map((project, displayIndex) => {
                    const originalIndex = projects.length - 1 - displayIndex;
                    // Spotlight comes from the text side: Odd has its text on the right
                    const side = originalIndex % 2 === 0 ? 'right' : 'left';
                    return (
                        <div
                            key={project.title}
                            ref={el => { beamRefs.current[displayIndex] = el; }}
                            className={`spotlight spotlight-${side}`}
                            style={{ '--spot': project.accent || '#ffffff', top: beamTops[displayIndex] || 0 }}
                        />
                    );
                })}
            </div>
            <div className="applications" ref={setAppsRef} key={`apps-${animationKey}`}>
                {displayProjects.map((project, displayIndex) => {
                    // Original index determines Odd/Even (0=Odd, 1=Even, etc.)
                    const originalIndex = projects.length - 1 - displayIndex;
                    const Component = originalIndex % 2 === 0 ? Odd : Even;

                    return (
                        <div
                            className="project-slot"
                            key={project.title}
                            ref={el => { slotRefs.current[displayIndex] = el; }}
                        >
                            <Component
                                {...project}
                                projectRef={el => {
                                    if (projectRefs?.current) {
                                        projectRefs.current[displayIndex] = el;
                                    }
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
});

export default Applications;
