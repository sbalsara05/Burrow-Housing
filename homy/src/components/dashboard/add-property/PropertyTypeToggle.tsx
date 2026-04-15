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
            <div className="lease-term-tag-group mb-3">
                <button
                    type="button"
                    className={`lease-term-tag lease-term-tag--fill ${propertyType === 'Apartment' ? 'is-selected' : ''}`}
                    onClick={() => onPropertyTypeChange('Apartment')}
                    aria-pressed={propertyType === 'Apartment'}
                >
                    Apartment
                </button>
                <button
                    type="button"
                    className={`lease-term-tag lease-term-tag--fill ${propertyType === 'Room' ? 'is-selected' : ''}`}
                    onClick={() => onPropertyTypeChange('Room')}
                    aria-pressed={propertyType === 'Room'}
                >
                    Room
                </button>
            </div>
            {propertyType === 'Room' && (
                <div className="lease-term-tag-group">
                    <button
                        type="button"
                        className={`lease-term-tag lease-term-tag--fill ${roomType === 'Single Room' ? 'is-selected' : ''}`}
                        onClick={() => onRoomTypeChange('Single Room')}
                        aria-pressed={roomType === 'Single Room'}
                    >
                        Single Room
                    </button>
                    <button
                        type="button"
                        className={`lease-term-tag lease-term-tag--fill ${roomType === 'Shared Room' ? 'is-selected' : ''}`}
                        onClick={() => onRoomTypeChange('Shared Room')}
                        aria-pressed={roomType === 'Shared Room'}
                    >
                        Shared Room
                    </button>
                </div>
            )}
        </div>
    );
};

export default PropertyTypeToggle;
