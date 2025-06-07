import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../src/redux/store';
import { addNewProperty } from '../../../../src/redux/slices/propertySlice';

async function getCoordinatesFromAddress(address: string) {
    const geocoder = new google.maps.Geocoder();

    return new Promise<{lat: number, lng: number}>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                resolve({
                    lat: location.lat(),
                    lng: location.lng()
                });
            } else {
                reject(new Error('Could not geocode address'));
            }
        });
    });
}

const PropertyForm = () => {
    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = async (formData: any) => {
        try {
            const coordinates = await getCoordinatesFromAddress(formData.addressAndLocation.address);
            const propertyData = {
                ...formData,
                addressAndLocation: {
                    ...formData.addressAndLocation,
                    location: coordinates
                }
            };
            await dispatch(addNewProperty(propertyData));
        } catch (error) {
            console.error('Error creating property:', error);
        }
    };

    return (
        // Add your form JSX here
        null
    );
};

export default PropertyForm;
