import React, { Component, ReactNode } from 'react';
import PropertyMap from './PropertyMap';

// Error Boundary for the Map
class MapErrorBoundary extends Component<
    { children: ReactNode; fallback?: ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        console.error('Map Error Boundary caught error:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Map Error Boundary details:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full min-h-[400px] flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg">
                    <div className="text-center p-6">
                        <div className="text-orange-500 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Error</h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            The interactive map encountered an error and couldn't load.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    // Force a page refresh to reset everything
                                    setTimeout(() => window.location.reload(), 100);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                            >
                                Refresh Page
                            </button>
                            <p className="text-xs text-gray-500">
                                You can still browse properties below
                            </p>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-xs text-gray-500">Show Error Details</summary>
                                <pre className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Safe PropertyMap wrapper
interface SafePropertyMapProps {
    properties: any[];
    selectedPropertyId?: string;
    onPropertySelect?: (property: any) => void;
    mapHeight?: string;
    className?: string;
}

const SafePropertyMap: React.FC<SafePropertyMapProps> = (props) => {
    return (
        <MapErrorBoundary>
            <PropertyMap {...props} />
        </MapErrorBoundary>
    );
};

export default SafePropertyMap;

// Usage in your ListingFourteenArea.tsx:
/*
import SafePropertyMap from './SafePropertyMap';

// In your component JSX, replace PropertyMap with:
<SafePropertyMap
    properties={sortedProperties}
    selectedPropertyId={selectedPropertyId || hoveredPropertyId}
    onPropertySelect={handlePropertySelect}
    mapHeight="100%"
    className="h-100"
/>
*/