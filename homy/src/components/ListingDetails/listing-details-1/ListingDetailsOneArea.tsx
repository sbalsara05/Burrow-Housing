import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/slices/store.ts';
import { toast } from 'react-toastify';
import axios from 'axios';

// Redux Imports
import {
    fetchPropertyById, selectPropertyFromList, clearCurrentProperty,
    selectCurrentProperty, selectPropertyLoading, selectPropertyError,
    clearPropertyError, selectAllPublicProperties, Property
} from '../../../redux/slices/propertySlice';
import { selectIsAuthenticated, selectCurrentUser } from '../../../redux/slices/authSlice';
import { fetchFavorites } from '../../../redux/slices/favoritesSlice';

// Component & Hook Imports
import Sidebar from "./Sidebar";
import MediaGallery from "./MediaGallery";
import CommonBanner from "../listing-details-common/CommonBanner";
import CommonPropertyOverview from "../listing-details-common/CommonPropertyOverview";
import CommonAmenities from "../listing-details-common/CommonAmenities";
import CommonNearbyList from "../listing-details-common/CommonNearbyList";
import CommonLocation from "../listing-details-common/CommonLocation";
import InterestedModal from '../../../modals/InterestedModal.tsx';
import CommonPropertyFeatureList from "../listing-details-common/CommonPropertyFeatureList";

const ListingDetailsOneArea = () => {
    const { id: propertyId } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Redux State
    const property = useSelector(selectCurrentProperty);
    const isLoading = useSelector(selectPropertyLoading);
    const error = useSelector(selectPropertyError);
    const allProperties = useSelector(selectAllPublicProperties);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);

    // Local state for modal and interest status
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [interestStatus, setInterestStatus] = useState<string | null>(null);
    const [isStatusLoading, setIsStatusLoading] = useState(true);

    // Fetch essential data on mount
    useEffect(() => {
        if (propertyId) {
            dispatch(clearPropertyError());
            const propFromList = allProperties.find(p => p._id === propertyId);
            if (propFromList) {
                dispatch(selectPropertyFromList(propFromList));
            } else {
                dispatch(fetchPropertyById(propertyId));
            }
        }
        if (isAuthenticated) {
            dispatch(fetchFavorites());
        }
        return () => {
            dispatch(clearCurrentProperty());
        };
    }, [propertyId, dispatch, allProperties, isAuthenticated]);

    // Fetch interest status for the current user and this specific property
    useEffect(() => {
        const checkInterestStatus = async () => {
            if (isAuthenticated && propertyId && currentUser?._id !== property?.userId) {
                setIsStatusLoading(true);
                try {
                    const response = await axios.get(`/api/interests/status?propertyId=${propertyId}`);
                    setInterestStatus(response.data.status);
                } catch (err) {
                    console.error("Failed to fetch interest status", err);
                    setInterestStatus(null);
                } finally {
                    setIsStatusLoading(false);
                }
            } else {
                setIsStatusLoading(false);
                setInterestStatus(null);
            }
        };
        if (property && currentUser) {
            checkInterestStatus();
        }
    }, [isAuthenticated, propertyId, property, currentUser]);

    // Handler for submitting the interest form
    const handleSubmitInterest = async (data: { message: string; moveInDate: string; }) => {
        if (!property) {
            toast.error("Property data is not available.");
            return;
        }
        try {
            await axios.post('/api/interests', {
                propertyId: property._id,
                message: data.message,
                moveInDate: data.moveInDate,
            });
            toast.success("Your request has been sent to the lister!");
            setInterestStatus('pending');
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to submit your request. You may have already applied.");
        }
    };

    // Render Logic
    if (isLoading && !property) {
        return <div className="container pt-200 pb-200 text-center">Loading property details...</div>;
    }

    if (error) {
        return <div className="container pt-200 pb-200 text-center alert alert-danger">Error: {error}</div>;
    }

    if (!property) {
        return <div className="container pt-200 pb-200 text-center">Property not found.</div>;
    }

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
        <>
            <div className="listing-details-one theme-details-one bg-pink pt-180 lg-pt-150 pb-150 xl-pb-120">
                <div className="container">
                    <CommonBanner property={property} />
                    <MediaGallery property={property} />

                    <div className="property-feature-list bg-white shadow4 bg-whiterounded p-40 mt-50 mb-60 tw-rounded-md">
                        <h4 className="sub-title-one mb-40 lg-mb-20">Property Overview</h4>
                        <CommonPropertyOverview property={property} />
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
                                    <CommonPropertyFeatureList property={property} />
                                </div>
                            </div>

                            <div className="property-amenities rounded shadow4 bg-white p-40 mb-50 tw-rounded-md">
                                <CommonAmenities amenities={property.amenities} />
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
                            onInterestedClick={() => setIsModalOpen(true)}
                            interestStatus={interestStatus}
                            isStatusLoading={isStatusLoading}
                        />
                    </div>
                </div>
            </div>

            <InterestedModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                property={property}
                onSubmit={handleSubmitInterest}
            />
        </>
    );
};

export default ListingDetailsOneArea;