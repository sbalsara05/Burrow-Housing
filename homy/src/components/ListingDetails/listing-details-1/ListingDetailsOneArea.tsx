// frontend/components/ListingDetails/listing-details-1/ListingDetailsOneArea.tsx
import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../redux/slices/store.ts';
import {
    fetchPropertyById,
    selectPropertyFromList,
    clearCurrentProperty,
    selectCurrentProperty,
    selectPropertyLoading,
    selectPropertyError,
    clearPropertyError,
    selectAllPublicProperties,
    Property
} from '../../../redux/slices/propertySlice';

// Import favorites functionality
import { fetchFavorites, selectFavoriteIds } from '../../../redux/slices/favoritesSlice';
import { selectIsAuthenticated } from '../../../redux/slices/authSlice';

// Import modal components
import InterestedModal from '../../../modals/InterestedModal';
import { useInterestedModal } from '../../../hooks/useInterestedModal';

// Import sub-components
import MediaGallery from "./MediaGallery";
import Sidebar from "./Sidebar";
import CommonBanner from "../listing-details-common/CommonBanner";
import CommonPropertyOverview from "../listing-details-common/CommonPropertyOverview";
import CommonPropertyFeatureList from "../listing-details-common/CommonPropertyFeatureList";
import CommonAmenities from "../listing-details-common/CommonAmenities";
import CommonNearbyList from "../listing-details-common/CommonNearbyList";
import CommonLocation from "../listing-details-common/CommonLocation";
import NiceSelect from "../../../ui/NiceSelect";

const ListingDetailsOneArea = () => {
    // 1. Get ID from URL
    const {id} = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();

    // 2. Select necessary state from Redux
    const property = useSelector(selectCurrentProperty);
    const isLoading = useSelector(selectPropertyLoading);
    const error = useSelector(selectPropertyError);
    const allProperties = useSelector(selectAllPublicProperties);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const favoriteIds = useSelector(selectFavoriteIds);

    // Debug logging
    console.log('ListingDetailsOneArea Debug:', {
        propertyId: id,
        isAuthenticated,
        favoriteIds,
        favoritesCount: favoriteIds.length
    });

    // 3. Initialize the interested modal hook
    const { isModalOpen, currentProperty, openModal, closeModal, handleSubmitInterest } = useInterestedModal({
        onSubmitInterest: async (data) => {
            console.log('Interest submitted:', data);
            alert('Interest submitted successfully!');
        }
    });

    // 4. Function to handle "I'm Interested" button click
    const handleInterestedClick = () => {
        if (property) {
            const fullAddress = property.addressAndLocation?.address || 'Address not available';
            const cleanAddress = fullAddress
                .replace(/,\s*USA?$/i, '')
                .replace(/,\s*United States$/i, '')
                .trim();
            const addressParts = cleanAddress.split(',');
            const streetAddress = addressParts[0]?.trim() || cleanAddress;

            openModal(property._id, streetAddress);
        }
    };

    // 5. Fetch favorites when user is authenticated
    useEffect(() => {
        console.log('Checking if should fetch favorites:', { isAuthenticated });
        if (isAuthenticated) {
            console.log('Fetching favorites...');
            dispatch(fetchFavorites());
        }
    }, [dispatch, isAuthenticated]);

    // 6. Fetch or select property data on mount/ID change
    useEffect(() => {
        if (id) {
            dispatch(clearPropertyError());

            const propertyFromList = allProperties.find(p => p._id === id);

            if (propertyFromList) {
                console.log(`ListingDetailsOneArea: Found property ${id} in allProperties list. Dispatching selectPropertyFromList.`);
                dispatch(selectPropertyFromList(propertyFromList));
            } else {
                console.log(`ListingDetailsOneArea: Property ${id} not in list. Dispatching fetchPropertyById API call.`);
                dispatch(fetchPropertyById(id));
            }
        } else {
            console.error("ListingDetailsOneArea: No property ID found in URL.");
            dispatch(selectPropertyFromList(null));
        }

        // Cleanup Function
        return () => {
            console.log("ListingDetailsOneArea: Unmounting, dispatching clearCurrentProperty.");
            dispatch(clearCurrentProperty());
            dispatch(clearPropertyError());
        };
    }, [id, dispatch, allProperties]);

    // 7. Handle loading state
    if (isLoading) {
        return <div className="container pt-200 pb-200 text-center">Loading property details...</div>;
    }

    // 8. Handle error state
    if (error) {
        return <div className="container pt-200 pb-200 text-center alert alert-danger">Error loading
            property: {error}</div>;
    }

    // 9. Handle property not found state
    if (!property) {
        return <div className="container pt-200 pb-200 text-center">Property details not available or ID is
            invalid.</div>;
    }

    // 10. Render details if property data is available
    const selectHandler = () => {
    };

    const locationData = {
        address: property.addressAndLocation?.address ||
                property.overview?.title ||
                'Property Location',
        latitude: property.addressAndLocation?.location?.lat ||
                 (property.geoLocation?.coordinates ? property.geoLocation.coordinates[1] : undefined),
        longitude: property.addressAndLocation?.location?.lng ||
                  (property.geoLocation?.coordinates ? property.geoLocation.coordinates[0] : undefined)
    };

    return (
        <div className="listing-details-one theme-details-one bg-pink pt-180 lg-pt-150 pb-150 xl-pb-120">
            <div className="container">
                <CommonBanner property={property}/>
                <MediaGallery property={property}/>

                <div className="property-feature-list bg-white shadow4 bg-whiterounded p-40 mt-50 mb-60 tw-rounded-md">
                    <h4 className="sub-title-one mb-40 lg-mb-20">Property Overview</h4>
                    <CommonPropertyOverview property={property}/>
                </div>

                <div className="row">
                    <div className="col-xl-8">
                        <div className="property-overview mb-50 bg-white shadow4  p-40 tw-rounded-md">
                            <h4 className="mb-20">Overview</h4>
                            <p className="fs-20 lh-lg">{property.description || "No detailed description available."}</p>
                        </div>

                        <div className="property-feature-accordion bg-white shadow4 p-40 mb-50 tw-rounded-md">
                            <h4 className="mb-20">Property Features</h4>
                            <p className="fs-20 lh-lg">Detailed characteristics of the property.</p>
                            <div className="accordion-style-two mt-45">
                                <CommonPropertyFeatureList property={property}/>
                            </div>
                        </div>

                        <div className="property-amenities rounded shadow4 bg-white p-40 mb-50 tw-rounded-md">
                            <CommonAmenities amenities={property.amenities}/>
                        </div>

                        <div className=" bg-white shadow4 p-40 mb-50 tw-rounded-md">
                            <CommonNearbyList
                                location={{
                                    address: property.addressAndLocation.address,
                                    lat: property.addressAndLocation.location.lat,
                                    lng: property.addressAndLocation.location.lng
                                }}
                            />
                        </div>

                        <div className="property-location tw-pb-0 tw-w-full ">
                            <CommonLocation
                                location={locationData}
                                propertyName={property.overview?.title || property.addressAndLocation?.address || 'Property'}
                            />
                        </div>
                    </div>

                    <Sidebar
                        property={property}
                        onInterestedClick={handleInterestedClick}
                    />
                </div>
            </div>

            <InterestedModal
                isOpen={isModalOpen}
                onClose={closeModal}
                propertyName={currentProperty?.name || ''}
                propertyId={currentProperty?.id || property._id}
                onSubmit={handleSubmitInterest}
            />
        </div>
    );
};

export default ListingDetailsOneArea;