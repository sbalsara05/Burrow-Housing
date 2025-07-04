// frontend/components/inner-pages/agency/agency-details/Review.tsx
import React, { useState, useEffect } from "react"; // Import hooks if fetching
import Fancybox from "../../../common/Fancybox";
import { Link } from "react-router-dom";
// import axios from 'axios'; // If fetching reviews

// Interface for review data (keep existing or adapt to API response)
interface ReviewData { id: number; img: string; title: string; date: string; total_rating: string; rating: string[]; desc: JSX.Element; img_slider?: { img_id: string; img: string; }[]; }

// Define props interface
interface ReviewProps {
    propertyId?: string | null; // ID of the property reviews are for
    style?: boolean; // Keep existing style prop
}

// Static data as fallback
const static_review_data: ReviewData[] = [ /* ... your existing static review data ... */];


const Review: React.FC<ReviewProps> = ({ propertyId, style }) => {
    // State for fetched reviews
    // const [reviews, setReviews] = useState<ReviewData[]>([]);
    // const [isLoading, setIsLoading] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const maxReviewsToShow = 2;

    // --- Effect to fetch reviews based on propertyId (optional) ---
    // useEffect(() => {
    //     if (propertyId) {
    //         const fetchReviews = async () => {
    //             setIsLoading(true);
    //             try {
    //                 // TODO: Implement API call: GET /api/properties/:propertyId/reviews
    //                 // const response = await axios.get(`/api/properties/${propertyId}/reviews`);
    //                 // setReviews(response.data.reviews);
    //                  console.warn(`Review component: Fetching reviews for ${propertyId} not implemented. Using static data.`);
    //                  setReviews(static_review_data); // Use static for now
    //             } catch (error) {
    //                 console.error("Failed to fetch reviews:", error);
    //                 setReviews(static_review_data); // Fallback
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         };
    //         fetchReviews();
    //     } else {
    //          // Use generic static reviews if no ID provided?
    //          setReviews(static_review_data);
    //     }
    // }, [propertyId]); // Refetch if propertyId changes

    // --- Use static data directly for now ---
    const reviews = static_review_data;


    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, maxReviewsToShow);

    // if (isLoading) return <div>Loading reviews...</div>;

    return (
        <>
            <div className="review-wrapper mb-35">
                {displayedReviews.length > 0 ? displayedReviews.map((item) => (
                    <div key={item.id} className="review">
                        <img src={item.img} alt="" className="rounded-circle avatar" />
                        <div className="text">
                            <div className="d-sm-flex justify-content-between">
                                {/* ... review content ... */}
                            </div>
                            <p className="fs-20 mt-20 mb-30">{item.desc}</p>
                            {/* Fancybox logic */}
                            {item.img_slider && (
                                <Fancybox options={{ Carousel: { infinite: true } }}>
                                    {/* ... fancybox gallery ... */}
                                </Fancybox>
                            )}
                            {/* Action buttons */}
                            {/* ... */}
                        </div>
                    </div>
                )) : (
                    <p>No reviews yet for this property.</p>
                )}
            </div>

            {reviews.length > maxReviewsToShow && (
                <button // Changed to button
                    type="button"
                    className={`load-more-review text-uppercase w-100 tran3s ${style ? "border-15 tran3s" : "fw-500 inverse rounded-0"}`}
                    onClick={() => setShowAllReviews(!showAllReviews)}
                >
                    {showAllReviews ? 'SHOW LESS' : 'VIEW ALL REVIEWS'}{' '}
                    <i className={`bi bi-arrow-${showAllReviews ? 'down' : 'up'}-right`}></i>
                </button>
            )}
        </>
    );
};

export default Review;