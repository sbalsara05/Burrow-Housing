import { useState, useEffect, useRef } from 'react';

interface SidebarStickyState {
    isSticky: boolean;
    shouldStick: boolean;
}

const UseSidebarSticky = (): SidebarStickyState => {
    const [isSticky, setIsSticky] = useState(false);
    const [shouldStick, setShouldStick] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const sidebarElement = document.querySelector('.sidebar-sticky-trigger');
            const footerElement = document.querySelector('footer') || document.querySelector('.footer');
            
            if (!sidebarElement) return;

            const sidebarRect = sidebarElement.getBoundingClientRect();
            const sidebarTop = sidebarRect.top + window.scrollY;
            const scrollPosition = window.scrollY;
            
            // Start sticking when user scrolls past the sidebar's original position
            const shouldStartSticking = scrollPosition > sidebarTop - 20; // 20px offset
            
            // Stop sticking when reaching footer
            let shouldStopAtFooter = false;
            if (footerElement) {
                const footerRect = footerElement.getBoundingClientRect();
                const footerTop = footerRect.top + window.scrollY;
                const sidebarHeight = sidebarRect.height;
                
                // Stop sticking when sidebar would overlap footer
                shouldStopAtFooter = scrollPosition + sidebarHeight + 40 > footerTop; // 40px buffer
            }

            setShouldStick(shouldStartSticking && !shouldStopAtFooter);
            setIsSticky(shouldStartSticking && !shouldStopAtFooter);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll); // Recalculate on resize
        
        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return { isSticky, shouldStick };
};

export default UseSidebarSticky;