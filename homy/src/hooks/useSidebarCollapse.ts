// src/hooks/useSidebarCollapse.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sidebar collapse state
 * Syncs with localStorage and provides consistent state across all dashboard pages
 */
export const useSidebarCollapse = () => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const saved = localStorage.getItem('homy-dashboard-sidebar-collapsed');
            return saved === 'true';
        } catch (error) {
            console.error('Error reading sidebar state from localStorage:', error);
            return false;
        }
    });

    // Listen for storage events (when localStorage changes in another component)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'homy-dashboard-sidebar-collapsed') {
                setIsCollapsed(e.newValue === 'true');
            }
        };

        // Also listen for custom event (for same-window updates)
        const handleCustomEvent = () => {
            try {
                const saved = localStorage.getItem('homy-dashboard-sidebar-collapsed');
                setIsCollapsed(saved === 'true');
            } catch (error) {
                console.error('Error reading sidebar state:', error);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('sidebar-collapse-change', handleCustomEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('sidebar-collapse-change', handleCustomEvent);
        };
    }, []);

    return isCollapsed;
};
