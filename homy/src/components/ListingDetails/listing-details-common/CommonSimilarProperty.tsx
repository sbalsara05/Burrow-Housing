// frontend/components/ListingDetails/listing-details-common/CommonSimilarProperty.tsx
import React, { useState, useEffect } from 'react'; // Import React and hooks if fetching
import Slider from "react-slick";
import { Link } from "react-router-dom";
import Fancybox from "../../common/Fancybox";
// Import static data as fallback/placeholder
import listing_data from "../../../data/inner-data/ListingData"; // Adjust path
// Import Property type if needed
// import { Property } from '../../../redux/slices/propertySlice';
// import axios from 'axios'; // If fetching dynamically

// Define props interface
interface CommonSimilarPropertyProps {
    currentPropertyId?: string | null; // ID of the property being viewed
}

const setting = { /* ... slider settings ... */ };

const CommonSimilarProperty: React.FC<CommonSimilarPropertyProps> = ({ currentPropertyId }) => {

    // --- State for dynamically fetched similar properties (optional) ---
    // const [similarProperties, setSimilarProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Effect to fetch similar properties (optional) ---
    // useEffect(() => {
    //     if (currentPropertyId) { // Only fetch if we have a current ID
    //         const fetchSimilar = async () => {
    //             setIsLoading(true);
    //             try {
    //                 // TODO: Implement API call: GET /api/properties/similar?basedOn=currentPropertyId&exclude=currentPropertyId&limit=4
    //                 // const response = await axios.get(`/api/properties/similar?exclude=${currentPropertyId}&limit=6`); // Example API call
    //                 // setSimilarProperties(response.data.properties);
    //
    //                 // --- Placeholder Fetch using static data ---
    //                  console.warn("CommonSimilarProperty: Dynamic fetch not implemented. Filtering static data.");
    //                  // Filter static data based on some criteria (e.g., same page/type, different ID)
    //                  const filteredStatic = listing_data
    //                      .filter(p => p._id !== currentPropertyId && p.id.toString() !== currentPropertyId) // Exclude current
    //                      // Add more similarity logic if needed (e.g., same neighborhood/category)
    //                      .slice(0, 6); // Limit results
    //                  setSimilarProperties(filteredStatic);
    //                  // --- End Placeholder Fetch ---
    //
    //             } catch (error) {
    //                 console.error("Failed to fetch similar properties:", error);
    //                 setSimilarProperties([]); // Clear on error
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         };
    //         fetchSimilar();
    //     } else {
    //         setSimilarProperties([]); // Clear if no current property ID
    //     }
    // }, [currentPropertyId]);

    // --- Use static data directly for now ---
    const similarProperties = listing_data
        .filter(p => (p._id !== currentPropertyId && p.id.toString() !== currentPropertyId) && p.page === 'home_3_property_2') // Example filtering
        .slice(0, 6); // Limit

    if (similarProperties.length === 0) {
        // Optionally render nothing or a message if no similar properties found
        // return null;
    }

    return (
        <div className="similar-property"> {/* Removed border/padding classes, handled by parent */}
            <h4 className="mb-40">Similar Homes You May Like</h4>
            {/* {isLoading && <div>Loading similar properties...</div>} */}
            {similarProperties.length > 0 ? (
                <Slider {...setting} className="similar-listing-slider-one">
                    {similarProperties.map((item: any) => ( // Use 'any' or map to Property type if possible
                        <div key={item._id || item.id} className="item">
                            <div className="listing-card-one shadow4 style-three border-30 mb-50">
                                {/* Card content using 'item' data */}
                                <div className="img-gallery p-15">
                                    <div className="position-relative border-20 overflow-hidden">
                                        <div className="tag bg-white text-dark fw-500 border-20">{item.tag || 'N/A'}</div>
                                        {/* Placeholder Image */}
                                        <img src={item.thumb || "/assets/images/listing/img_13.jpg"} className="w-100 border-20" alt={item.title || 'Similar Property'} />
                                        <Link to={`/listing_details/${item._id || item.id}`} className="btn-four inverse rounded-circle position-absolute">
                                            <i className="bi bi-arrow-up-right"></i>
                                        </Link>
                                        {/* Fancybox logic if applicable */}
                                        {/* <div className="img-slider-btn">...</div> */}
                                    </div>
                                </div>
                                <div className="property-info pe-4 ps-4">
                                    <Link to={`/listing_details/${item._id || item.id}`} className="title tran3s">{item.title || 'Similar Property'}</Link>
                                    <div className="address m0 pb-5">{item.address || 'Address unavailable'}</div>
                                    <div className="pl-footer m0 d-flex align-items-center justify-content-between">
                                        <strong className="price fw-500 color-dark">${item.price?.toLocaleString() || 'N/A'}</strong>
                                        <ul className="style-none d-flex action-icons">
                                            <li><Link to="#"><i className="fa-light fa-heart"></i></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            ) : (
                !isLoading && <p>No similar properties found.</p>
            )}
        </div>
    );
};

export default CommonSimilarProperty;