// frontend/components/ListingDetails/listing-details-common/CommonPropertyFloorPlan.tsx
import React from 'react'; // Import React
import Slider from 'react-slick';

// Define expected structure for a single floor plan
interface FloorPlan {
    // id?: string; // Optional ID
    title?: string; // Optional title (e.g., "1st Floor")
    imageUrl: string; // Required image URL/path
    // Add other details if needed: sqft, beds, baths
}

// Define props interface
interface CommonPropertyFloorPlanProps {
    floorPlans?: FloorPlan[] | null; // Array of floor plan objects
    style?: boolean; // Keep existing style prop
}

const CommonPropertyFloorPlan: React.FC<CommonPropertyFloorPlanProps> = ({ floorPlans, style }) => {

    // Check if floor plan data exists and is an array with items
    const hasFloorPlans = Array.isArray(floorPlans) && floorPlans.length > 0;

    if (!hasFloorPlans) {
        // Optionally render nothing or a message if no floor plans
        // return <div className="property-floor-plan mb-50"><h4 className="mb-40">Floor Plans</h4><p>No floor plans available.</p></div>;
        return null;
    }

    const settings = {
        dots: true,
        infinite: floorPlans.length > 1, // Only loop if more than one
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        arrows: false, // Consider adding arrows if many plans
    };

    return (
        <div className={`property-floor-plan ${style ? "bottom-line-dark pb-40 mb-60" : "mb-50"}`}>
            <h4 className="mb-40">Floor Plans</h4>
            <div className={`p-30 ${style ? "bg-dot" : "bg-white shadow4 border-20"}`}>
                <div id="floor-plan-slider" className="carousel slide"> {/* Unique ID */}
                    <Slider {...settings} className="carousel-inner">
                        {/* Map over the floorPlans array from props */}
                        {floorPlans.map((plan, index) => (
                            <div key={plan.id || index} className="carousel-item active"> {/* Simplification: always active in react-slick */}
                                {/* Optionally display title */}
                                {plan.title && <h5 className='text-center mb-3'>{plan.title}</h5>}
                                <img
                                    src={plan.imageUrl} // Use dynamic image URL
                                    alt={plan.title || `Floor Plan ${index + 1}`}
                                    className="w-100 border-15" // Add border style if needed
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default CommonPropertyFloorPlan;