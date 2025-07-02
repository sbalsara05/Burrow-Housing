// frontend/components/ListingDetails/listing-details-sidebar/FeatureListing.tsx
import React, { useState, useEffect } from 'react'; // Import React if using state/effect
import { Link } from "react-router-dom";
import Fancybox from "../../common/Fancybox";
import Slider from 'react-slick';
// Import Property type if needed
// import { Property } from '../../../redux/slices/propertySlice';

const largeThumb: string[] = ["1", "2", "3"];

// Define props interface
interface FeatureListingProps {
    currentPropertyId?: string | null; // ID of the property being viewed
}

// Keep static data for now, filtering/dynamic fetch needs implementation
const static_feature_listing_data = [
    { id: 1, _id: "static1", thumb: "/assets/images/listing/img_13.jpg", class_name: "active", large_thumb: [], tag: "FOR RENT", price: 123710, address: "120 Elgin St. Celina, Delaware" },
    { id: 2, _id: "static2", thumb: "/assets/images/listing/img_14.jpg", large_thumb: [], tag: "FOR RENT", price: 211536, address: "120 Elgin St. Celina, Delaware" },
    { id: 3, _id: "static3", thumb: "/assets/images/listing/img_15.jpg", large_thumb: [], tag: "FOR RENT", price: 305958, address: "120 Elgin St. Celina, Delaware" },
    // Add more static items if needed
];


const FeatureListing: React.FC<FeatureListingProps> = ({ currentPropertyId }) => {

    // --- State for dynamically fetched featured listings (optional) ---
    // const [featuredListings, setFeaturedListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Effect to fetch featured listings (optional) ---
    // useEffect(() => {
    //     const fetchFeatured = async () => {
    //         setIsLoading(true);
    //         try {
    //             // TODO: API call to fetch featured listings, potentially excluding currentPropertyId
    //             // Example: const response = await axios.get(`/api/properties/featured?exclude=${currentPropertyId}`);
    //             // setFeaturedListings(response.data.properties);
    //             console.warn("FeatureListing: Dynamic fetch not implemented. Using static data.");
    //             setFeaturedListings(static_feature_listing_data.filter(p => p._id !== currentPropertyId)); // Filter static data
    //         } catch (error) {
    //             console.error("Failed to fetch featured listings:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchFeatured();
    // }, [currentPropertyId]); // Refetch if current property changes

    // --- Use static data directly for now ---
    const listingsToDisplay = static_feature_listing_data.filter(p => p._id !== currentPropertyId);


    const settings = { /* ... slider settings ... */ };

    // Handle case where there are no listings to display after filtering
    if (listingsToDisplay.length === 0) {
        return (
            <div className="feature-listing bg-white border-20 p-30">
                <h5 className="mb-40">Featured Listing</h5>
                <p>No other featured listings available.</p>
            </div>
        );
    }


    return (
        <div className="feature-listing bg-white border-20 p-30">
            <h5 className="mb-40">Featured Listing</h5>
            {/* {isLoading && <div>Loading...</div>} */}
            {/* Use listingsToDisplay which is filtered static data */}
            {!isLoading && listingsToDisplay.length > 0 && (
                <div id="F-listing" className="carousel slide">
                    <Slider {...settings} className="carousel-inner">
                        {listingsToDisplay.map((item) => (
                            <div key={item.id} className={`carousel-item ${item.class_name || ''}`}> {/* Use item._id or item.id */}
                                <div className="listing-card-one style-three border-10">
                                    <div className="img-gallery">
                                        <div className="position-relative border-10 overflow-hidden">
                                            <div className="tag bg-white text-dark fw-500 border-20">{item.tag}</div>
                                            {/* Ensure link points to correct details page structure */}
                                            <Link to={`/listing_details_01/${item._id || item.id}`} className="fav-btn tran3s"><i className="fa-light fa-heart"></i></Link>
                                            <img src={item.thumb} className="w-100 border-10" alt="..." />
                                            <div className="img-slider-btn">
                                                03 <i className="fa-regular fa-image"></i>
                                                <Fancybox options={{ Carousel: { infinite: true } }}>
                                                    {/* Update fancybox links if dynamic */}
                                                    {largeThumb.map((thumb: any, index: any) => (
                                                        <a key={index} className="d-block" data-fancybox={`imgFeatured-${item._id || item.id}`} href={`/assets/images/listing/img_large_0${thumb}.jpg`}></a>
                                                    ))}
                                                </Fancybox>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="property-info mt-15">
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <strong className="price fw-500 color-dark">${item.price.toLocaleString()}</strong>
                                                <div className="address m0 pt-5">{item.address}</div>
                                            </div>
                                            {/* Ensure link points to correct details page structure */}
                                            <Link to={`/listing_details_01/${item._id || item.id}`} className="btn-four rounded-circle">
                                                <i className="bi bi-arrow-up-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
        </div>
    );
};

export default FeatureListing;