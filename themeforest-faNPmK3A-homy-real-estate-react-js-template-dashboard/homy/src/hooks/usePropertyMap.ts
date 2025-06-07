import {useState, useCallback, useEffect} from 'react';
import { Property } from '../redux/slices/propertySlice';
interface UsePropertyMapReturn {
    selectedPropertyId: string | undefined;
    hoveredPropertyId: string | undefined;
    mapBounds: google.maps.LatLngBounds | null;
    handlePropertySelect: (property: Property) => void;
    handlePropertyHover: (propertyId: string, isHovered: boolean) => void;
    handleMapBoundsChange: (bounds: google.maps.LatLngBounds) => void;
    scrollToProperty: (propertyId: string) => void;
    isPropertyVisible: (property: Property) => boolean;
    getPropertyStats: (properties: Property[]) => {
        total: number;
        affordable: number;
        midRange: number;
        expensive: number;
        averagePrice: number;
    };
}

interface UsePropertyMapOptions {
    onPropertySelect?: (property: Property) => void;
    onPropertyHover?: (propertyId: string, isHovered: boolean) => void;
    scrollBehavior?: 'smooth' | 'auto';
    autoSelectFirst?: boolean;
}

export const usePropertyMap = (
    properties: Property[],
    options: UsePropertyMapOptions = {}
): UsePropertyMapReturn => {
    const {
        onPropertySelect,
        onPropertyHover,
        scrollBehavior = 'smooth',
        autoSelectFirst = false
    } = options;

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
    const [hoveredPropertyId, setHoveredPropertyId] = useState<string | undefined>();
    const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);

    // Auto-select first property if enabled and properties available
    useEffect(() => {
        if (autoSelectFirst && properties.length > 0 && !selectedPropertyId) {
            const firstProperty = properties.find(p =>
                p.addressAndLocation?.location?.lat &&
                p.addressAndLocation?.location?.lng
            );
            if (firstProperty) {
                setSelectedPropertyId(firstProperty._id);
            }
        }
    }, [properties, autoSelectFirst, selectedPropertyId]);

    const handlePropertySelect = useCallback((property: Property) => {
        setSelectedPropertyId(property._id);
        scrollToProperty(property._id);

        // Call external handler if provided
        if (onPropertySelect) {
            onPropertySelect(property);
        }
    }, [onPropertySelect]);

    const handlePropertyHover = useCallback((propertyId: string, isHovered: boolean) => {
        setHoveredPropertyId(isHovered ? propertyId : undefined);

        // Call external handler if provided
        if (onPropertyHover) {
            onPropertyHover(propertyId, isHovered);
        }
    }, [onPropertyHover]);

    const handleMapBoundsChange = useCallback((bounds: google.maps.LatLngBounds) => {
        setMapBounds(bounds);
    }, []);

    const scrollToProperty = useCallback((propertyId: string) => {
        const propertyCard = document.getElementById(`property-card-${propertyId}`);
        if (propertyCard) {
            propertyCard.scrollIntoView({
                behavior: scrollBehavior,
                block: 'center',
                inline: 'nearest'
            });

            // Add temporary highlight animation
            propertyCard.classList.add('just-selected');
            setTimeout(() => {
                propertyCard.classList.remove('just-selected');
            }, 500);
        }
    }, [scrollBehavior]);

    const isPropertyVisible = useCallback((property: Property): boolean => {
        if (!mapBounds || !property.addressAndLocation?.location) {
            return true; // Show all if no bounds or no location
        }

        const {lat, lng} = property.addressAndLocation.location;
        if (!lat || !lng) return false;

        const position = new google.maps.LatLng(lat, lng);
        return mapBounds.contains(position);
    }, [mapBounds]);

    const getPropertyStats = useCallback((properties: Property[]) => {
        const stats = {
            total: properties.length,
            affordable: 0,
            midRange: 0,
            expensive: 0,
            averagePrice: 0
        };

        if (properties.length === 0) return stats;

        let totalPrice = 0;

        properties.forEach(property => {
            const price = property.overview.rent;
            totalPrice += price;

            if (price <= 2000) {
                stats.affordable++;
            } else if (price <= 3000) {
                stats.midRange++;
            } else {
                stats.expensive++;
            }
        });

        stats.averagePrice = Math.round(totalPrice / properties.length);

        return stats;
    }, []);

    return {
        selectedPropertyId,
        hoveredPropertyId,
        mapBounds,
        handlePropertySelect,
        handlePropertyHover,
        handleMapBoundsChange,
        scrollToProperty,
        isPropertyVisible,
        getPropertyStats
    };
};

// Additional utility functions for map-related operations
export const mapUtils = {
    // Calculate distance between two coordinates
    calculateDistance: (
        point1: { lat: number; lng: number },
        point2: { lat: number; lng: number }
    ): number => {
        const R = 3959; // Earth's radius in miles
        const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
        const dLng = (point2.lng - point1.lng) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(point1.lat * (Math.PI / 180)) * Math.cos(point2.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    // Get optimal zoom level based on properties spread
    getOptimalZoom: (properties: Property[]): number => {
        if (properties.length === 0) return 12;
        if (properties.length === 1) return 15;

        const validProperties = properties.filter(p =>
            p.addressAndLocation?.location?.lat && p.addressAndLocation?.location?.lng
        );

        if (validProperties.length === 0) return 12;

        const bounds = new google.maps.LatLngBounds();
        validProperties.forEach(property => {
            const {lat, lng} = property.addressAndLocation.location;
            bounds.extend(new google.maps.LatLng(lat, lng));
        });

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        const latDiff = ne.lat() - sw.lat();
        const lngDiff = ne.lng() - sw.lng();
        const maxDiff = Math.max(latDiff, lngDiff);

        if (maxDiff > 0.5) return 10;
        if (maxDiff > 0.1) return 12;
        if (maxDiff > 0.05) return 13;
        if (maxDiff > 0.01) return 14;
        return 15;
    },

    // Get center point of properties
    getCenterPoint: (properties: Property[]): { lat: number; lng: number } => {
        const validProperties = properties.filter(p =>
            p.addressAndLocation?.location?.lat && p.addressAndLocation?.location?.lng
        );

        if (validProperties.length === 0) {
            // Default to Boston if no properties
            return {lat: 42.3601, lng: -71.0589};
        }

        const totalLat = validProperties.reduce((sum, p) => sum + p.addressAndLocation.location.lat, 0);
        const totalLng = validProperties.reduce((sum, p) => sum + p.addressAndLocation.location.lng, 0);

        return {
            lat: totalLat / validProperties.length,
            lng: totalLng / validProperties.length
        };
    },

    // Format address for display
    formatAddress: (address: string): string => {
        if (!address) return 'Address not available';

        // Remove common suffixes and clean up
        return address
            .replace(/,\s*USA?$/i, '')
            .replace(/,\s*United States$/i, '')
            .trim();
    },

    // Get marker color based on price
    getMarkerColor: (price: number): string => {
        if (price > 3000) return '#FF6B6B'; // Red for expensive
        if (price > 2000) return '#4ECDC4'; // Teal for mid-range
        return '#45B7D1'; // Blue for affordable
    },

    // Generate marker content HTML
    generateMarkerHTML: (price: number, isSelected: boolean = false): string => {
        const colorClass = price > 3000 ? 'bg-red-500' :
            price > 2000 ? 'bg-teal-500' : 'bg-blue-500';
        const scaleClass = isSelected ? 'scale-110' : 'scale-100';
        const zIndexClass = isSelected ? 'z-50' : 'z-10';

        return `
            <div class="${colorClass} ${scaleClass} ${zIndexClass} text-white px-3 py-2 rounded-full font-bold text-sm shadow-lg border-2 border-white cursor-pointer transition-all duration-300 hover:scale-110">
                ${price.toLocaleString()}
            </div>
        `;
    }
};

export default usePropertyMap;