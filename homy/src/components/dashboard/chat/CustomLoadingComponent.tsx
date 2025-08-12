import React from 'react';

const CustomLoadingComponent = () => {
    return (
        <div className="burrow-loading-state">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="burrow-loading-state__text">Loading Messages...</p>
        </div>
    );
};

export default CustomLoadingComponent;