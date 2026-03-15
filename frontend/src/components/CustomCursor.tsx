"use client";

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.getAttribute('role') === 'button'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [cursorX, cursorY, isVisible]);

    return (
        <>
            <style jsx global>{`
        *, body, a, button, input, select, textarea, label {
          cursor: none !important;
        }
        @media (max-width: 768px) {
           *, body, a, button, input, select, textarea, label {
             cursor: auto !important;
           }
           .custom-cursor {
             display: none !important;
           }
        }
      `}</style>
            {/* Outer ring */}
            <motion.div
                className="custom-cursor"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid #1a1a2e',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.5)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    opacity: isVisible ? 1 : 0,
                    backgroundColor: isHovering ? 'rgba(26, 26, 46, 0.15)' : 'transparent',
                }}
                animate={{
                    scale: isHovering ? 2 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
            {/* Center dot */}
            <motion.div
                className="custom-cursor"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    position: 'fixed',
                    left: 13,
                    top: 13,
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#1a1a2e',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    opacity: isVisible ? 1 : 0,
                }}
            />
        </>
    );
}

