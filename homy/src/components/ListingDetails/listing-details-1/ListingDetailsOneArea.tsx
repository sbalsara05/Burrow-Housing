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
    selectAllPublicProperties, // Needed to check if property is already in list state
    Property // Import the Property interface
} from '../../../redux/slices/propertySlice';

// Import sub-components
import MediaGallery from "./MediaGallery"; // Assuming this uses props now
import Sidebar from "./Sidebar";         // Assuming this uses props now
import CommonBanner from "../listing-details-common/CommonBanner"; // Needs 'property' prop
import CommonPropertyOverview from "../listing-details-common/CommonPropertyOverview"; // Needs 'property' prop
import CommonPropertyFeatureList from "../listing-details-common/CommonPropertyFeatureList"; // Needs 'property' prop
import CommonAmenities from "../listing-details-common/CommonAmenities"; // Needs 'amenities' prop from property
import CommonNearbyList from "../listing-details-common/CommonNearbyList"; // Needs 'location' prop
import CommonSimilarProperty from "../listing-details-common/CommonSimilarProperty"; // Needs 'currentPropertyId' prop
import CommonLocation from "../listing-details-common/CommonLocation"; // Needs 'location' prop
import NiceSelect from "../../../ui/NiceSelect"; // Keep for review sorting

const ListingDetailsOneArea = () => {
    // 1. Get ID from URL
    const {id} = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();

    // 2. Select necessary state from Redux
    const property = useSelector(selectCurrentProperty); // The specific property being viewed
    const isLoading = useSelector(selectPropertyLoading);
    const error = useSelector(selectPropertyError);
    const allProperties = useSelector(selectAllPublicProperties); // List of properties from listing pages

    // 3. Fetch or select property data on mount/ID change
    useEffect(() => {
        if (id) {
            dispatch(clearPropertyError()); // Clear errors from previous attempts

            // Try finding in the already loaded list first
            const propertyFromList = allProperties.find(p => p._id === id);

            if (propertyFromList) {
                // If found, set it directly (synchronous)
                console.log(`ListingDetailsOneArea: Found property ${id} in allProperties list. Dispatching selectPropertyFromList.`);
                dispatch(selectPropertyFromList(propertyFromList));
            } else {
                // If not found, fetch from API (asynchronous fallback)
                console.log(`ListingDetailsOneArea: Property ${id} not in list. Dispatching fetchPropertyById API call.`);
                dispatch(fetchPropertyById(id));
            }
        } else {
            console.error("ListingDetailsOneArea: No property ID found in URL.");
            dispatch(selectPropertyFromList(null)); // Clear property if ID is invalid/missing
        }

        // 4. Cleanup Function: Clear the current property when leaving the page
        return () => {
            console.log("ListingDetailsOneArea: Unmounting, dispatching clearCurrentProperty.");
            dispatch(clearCurrentProperty());
            dispatch(clearPropertyError()); // Also clear errors on unmount
        };
    }, [id, dispatch, allProperties]); // Rerun if ID changes or the list updates (might find it next time)

    // 5. Handle loading state
    if (isLoading) {
        return <div className="container pt-200 pb-200 text-center">Loading property details...</div>;
    }

    // 6. Handle error state
    if (error) {
        return <div className="container pt-200 pb-200 text-center alert alert-danger">Error loading
            property: {error}</div>;
    }

    // 7. Handle property not found state (after loading/error check)
    if (!property) {
        return <div className="container pt-200 pb-200 text-center">Property details not available or ID is
            invalid.</div>;
    }

    // 8. Render details if property data is available
    const selectHandler = () => {
    }; // Placeholder for review sort dropdown

    // Debug the property structure to find address and location data
    console.log("Property data:", property);
    console.log("Address:", property.address);
    console.log("Location object:", property.location);
    console.log("AddressAndLocation object:", property.addressAndLocation);

    // Prepare the location data to pass to CommonLocation
    const locationData = {
        // Try to get address from multiple possible locations in the property object
        // This line might be causing issues:
        address: property.address ||
            (property.addressAndLocation?.address) ||
            `${property.title || property.name}, ${property.neighborhood || "Boston"}, MA`,

        // Try to get coordinates from multiple possible locations
        latitude: property.location?.lat ||
            property.addressAndLocation?.latitude ||
            (property.geoLocation?.coordinates ? property.geoLocation.coordinates[1] : undefined),

        longitude: property.location?.lng ||
            property.addressAndLocation?.longitude ||
            (property.geoLocation?.coordinates ? property.geoLocation.coordinates[0] : undefined)
    };

    return (
        <div className="listing-details-one theme-details-one bg-pink pt-180 lg-pt-150 pb-150 xl-pb-120">
            <div className="container">
                {/* Pass fetched 'property' data down as props */}
                <CommonBanner property={property}/>
                <MediaGallery property={property}/> {/* Modify if gallery images come from property.images */}

                <div className="property-feature-list bg-white shadow4 bg-whiterounded p-40 mt-50 mb-60">
                    <h4 className="sub-title-one mb-40 lg-mb-20">Property Overview</h4>
                    <CommonPropertyOverview property={property}/>
                </div>


                <div className="row">
                    <div className="col-xl-8">
                        {/* Overview Description */}
                        <div className="property-overview mb-50 bg-white shadow4  p-40">
                            <h4 className="mb-20">Overview</h4>
                            <p className="fs-20 lh-lg">{property.description || "No detailed description available."}</p>
                        </div>

                        {/* Property Features */}
                        <div className="property-feature-accordion bg-white shadow4 p-40 mb-50">
                            <h4 className="mb-20">Property Features</h4>
                            <p className="fs-20 lh-lg">Detailed characteristics of the property.</p>
                            <div className="accordion-style-two mt-45">
                                <CommonPropertyFeatureList property={property}/>
                            </div>
                        </div>


                        {/* Amenities */}
                        <div className="property-amenities rounded shadow4 bg-white p-40 mb-50">
                            {/* Pass amenities array from property object */}
                            <CommonAmenities amenities={property.amenities}/>
                        </div>

                        {/* Nearby */}
                        <div className=" bg-white shadow4 p-40 mb-50">
                            {/* Pass location details */}
                            <CommonNearbyList
                                location={{
                                    address: property.addressAndLocation.address,
                                    lat: property.addressAndLocation.location.lat,
                                    lng: property.addressAndLocation.location.lng
                                }}
                            />

                        </div>

                        {/* Similar Properties */}
                        {/* Pass current property ID to find similar ones */}
                        <CommonSimilarProperty currentPropertyId={property._id}/>

                        {/* Walk Score  (come back to this)*/}
                        {/*<div className="property-score bg-white shadow4 p-40 mb-50 ">*/}
                        {/*    /!* Pass relevant data if score depends on property *!/*/}
                        {/*    <CommonProPertyScore property={property}/>*/}
                        {/*</div>*/}

                        {/* Location Map */}
                        <div className="property-location mb-50 tw-w-full ">
                            <CommonLocation
                                location={locationData}
                                propertyName={property.title || property.name}
                            />
                        </div>

                        {/* Reviews */}
                        <div className="review-panel-one bg-white shadow4 p-40 mb-50">
                            <div className="position-relative z-1">
                                <div className="d-sm-flex justify-content-between align-items-center mb-10">
                                    <h4 className="m0 xs-pb-30">Reviews</h4>
                                    <NiceSelect
                                        className="nice-select"
                                        options={[{value: "01", text: "Newest"}, {value: "02", text: "Best Rating"},]}
                                        defaultCurrent={0}
                                        onChange={selectHandler}
                                        name="review-sort"
                                        placeholder="Sort Reviews"
                                    />
                                </div>
                                {/* Pass property ID to fetch/display relevant reviews */}
                                {/* <Review propertyId={property._id} style={true}/> */}
                            </div>
                        </div>

                        {/* Review Form section removed as requested */}

                    </div>

                    {/* Sidebar */}
                    {/* Pass property data if sidebar needs it (e.g., agent info, price) */}
                    <Sidebar property={property}/>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailsOneArea;