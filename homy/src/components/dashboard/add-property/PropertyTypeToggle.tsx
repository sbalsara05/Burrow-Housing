import React from 'react';

interface PropertyTypeToggleProps {
    propertyType: string; // 'Apartment' or 'Room'
    roomType: string; // 'Single Room' or 'Shared Room'
    onPropertyTypeChange: (value: string) => void;
    onRoomTypeChange: (value: string) => void;
}

const PropertyTypeToggle: React.FC<PropertyTypeToggleProps> = ({ 
    propertyType, 
    roomType, 
    onPropertyTypeChange, 
    onRoomTypeChange 
}) => {
    return (
        <div>
            <div className="d-flex gap-3 mb-3">
                <button
                    type="button"
                    className={`property-type-toggle ${propertyType === 'Apartment' ? 'active' : ''}`}
                    onClick={() => onPropertyTypeChange('Apartment')}
                >
                    Apartment
                </button>
                <button
                    type="button"
                    className={`property-type-toggle ${propertyType === 'Room' ? 'active' : ''}`}
                    onClick={() => onPropertyTypeChange('Room')}
                >
                    Room
                </button>
            </div>
            {propertyType === 'Room' && (
                <div className="d-flex gap-3">
                    <button
                        type="button"
                        className={`property-type-toggle ${roomType === 'Single Room' ? 'active' : ''}`}
                        onClick={() => onRoomTypeChange('Single Room')}
                    >
                        Single Room
                    </button>
                    <button
                        type="button"
                        className={`property-type-toggle ${roomType === 'Shared Room' ? 'active' : ''}`}
                        onClick={() => onRoomTypeChange('Shared Room')}
                    >
                        Shared Room
                    </button>
                </div>
            )}
        </div>
    );
};

export default PropertyTypeToggle;
