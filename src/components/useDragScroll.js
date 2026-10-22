import { useEffect } from 'react';

// Click-and-drag (left or middle mouse button) scrolls the page, with a bit of
// momentum on release. A press that doesn't move past THRESHOLD is a normal
// click; a drag swallows the click that follows, so it never opens a link.
// Touch and pen keep their native scrolling.
const THRESHOLD = 5;      // px before a press becomes a drag
const FRICTION = 0.94;    // momentum decay per frame
const INTERACTIVE = 'button, a, input, textarea, select, label, [role="button"]';

// Presses on anything clickable (buttons, links, the project images / icons /
// titles, which use cursor: pointer) never start a drag
const isInteractive = (el) =>
    el instanceof Element &&
    (!!el.closest(INTERACTIVE) || getComputedStyle(el).cursor === 'pointer');

const useDragScroll = () => {
    useEffect(() => {
        let drag = null;
        let momentumId = null;

        const stopMomentum = () => {
            cancelAnimationFrame(momentumId);
            momentumId = null;
        };

        const onPointerDown = (e) => {
            if (e.pointerType !== 'mouse' || (e.button !== 0 && e.button !== 1)) return;
            stopMomentum();
            if (isInteractive(e.target)) return;
            drag = { startX: e.clientX, startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, velocity: 0, moved: false };
        };

        // Middle button: stop the browser's own autoscroll so it drags like the left button
        const onMouseDown = (e) => {
            if (e.button === 1 && !isInteractive(e.target)) e.preventDefault();
        };

        const onPointerMove = (e) => {
            if (!drag) return;
            // Button was released outside the window
            if (e.buttons === 0) { onPointerCancel(); return; }
            if (!drag.moved) {
                if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < THRESHOLD) return;
                drag.moved = true;
                document.documentElement.classList.add('drag-scrolling');
                window.getSelection()?.removeAllRanges();
            }
            const dy = e.clientY - drag.lastY;
            const dt = Math.max(1, e.timeStamp - drag.lastT);
            window.scrollBy(0, -dy);
            drag.velocity = 0.8 * (-dy / dt) + 0.2 * drag.velocity; // px per ms
            drag.lastY = e.clientY;
            drag.lastT = e.timeStamp;
        };

        const onPointerUp = (e) => {
            if (!drag) return;
            const { moved, velocity, lastT } = drag;
            drag = null;
            if (!moved) return;
            document.documentElement.classList.remove('drag-scrolling');

            // Swallow the click / middle-click that ends this drag
            const swallow = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
            window.addEventListener('click', swallow, true);
            window.addEventListener('auxclick', swallow, true);
            setTimeout(() => {
                window.removeEventListener('click', swallow, true);
                window.removeEventListener('auxclick', swallow, true);
            }, 0);

            // Glide on if the mouse was still moving when released
            let speed = e.timeStamp - lastT > 80 ? 0 : velocity * 16; // px per frame
            const glide = () => {
                if (Math.abs(speed) < 0.5) { momentumId = null; return; }
                window.scrollBy(0, speed);
                speed *= FRICTION;
                momentumId = requestAnimationFrame(glide);
            };
            momentumId = requestAnimationFrame(glide);
        };

        const onPointerCancel = () => {
            drag = null;
            document.documentElement.classList.remove('drag-scrolling');
        };

        // Images would otherwise start a native drag-and-drop
        const onDragStart = (e) => e.preventDefault();

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerCancel);
        window.addEventListener('dragstart', onDragStart);
        window.addEventListener('wheel', stopMomentum, { passive: true });
        return () => {
            stopMomentum();
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerCancel);
            window.removeEventListener('dragstart', onDragStart);
            window.removeEventListener('wheel', stopMomentum);
            document.documentElement.classList.remove('drag-scrolling');
        };
    }, []);
};

export default useDragScroll;
