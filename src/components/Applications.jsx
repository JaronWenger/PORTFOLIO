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

// Beams ease toward their target strength instead of snapping to it, so even a
// fast jump to a project brings its light up slowly. Time constants in seconds:
// slow to light up, a little quicker to fade out.
const RISE_TAU = 0.6;
const FALL_TAU = 0.4;

// Projects already on screen at load wait for the hero title before fading in
const INITIAL_REVEAL_DELAY = 0.6;

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

        // Keeps animating until every beam has settled on its target
        let frame = null;
        let lastTime = null;
        const current = [];
        const updateStrength = (time) => {
            frame = null;
            const dt = lastTime === null ? 0 : Math.min(0.1, (time - lastTime) / 1000);
            const vh = window.innerHeight;
            let settled = true;
            slotRefs.current.forEach((slot, i) => {
                const beam = beamRefs.current[i];
                if (!slot || !beam) return;
                const rect = slot.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - vh / 2);
                const target = Math.min(
                    strengthFrom(distance, rect.height, 0.1, 1.2),
                    strengthFrom(distance, vh, 0.06, 0.44)
                );
                const value = current[i] || 0;
                const tau = target > value ? RISE_TAU : FALL_TAU;
                let next = value + (target - value) * (1 - Math.exp(-dt / tau));
                if (Math.abs(target - next) < 0.002) next = target;
                else settled = false;
                current[i] = next;
                beam.style.setProperty('--beam', next.toFixed(3));
            });
            if (settled) lastTime = null;
            else {
                lastTime = time;
                frame = requestAnimationFrame(updateStrength);
            }
        };
        const scheduleStrength = () => {
            if (!frame) frame = requestAnimationFrame(updateStrength);
        };

        measure();
        scheduleStrength();
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

    // Each project fades in the first time it scrolls into view (CSS keys the
    // animation off .revealed). Slots remount when animationKey changes, so
    // this re-runs and the projects reveal again.
    useLayoutEffect(() => {
        const start = performance.now();
        const observer = new IntersectionObserver((entries) => {
            const elapsed = (performance.now() - start) / 1000;
            const delay = Math.max(0, INITIAL_REVEAL_DELAY - elapsed);
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.setProperty('--reveal-delay', `${delay.toFixed(2)}s`);
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -10% 0px' });
        slotRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
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
