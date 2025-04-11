// frontend/components/ListingDetails/listing-details-1/MediaGallery.tsx
import React, { useState, useEffect } from "react"; // Import React and hooks
import Fancybox from "../../common/Fancybox";
import { Property } from '../../../redux/slices/propertySlice'; // Adjust path

// Define props interface
interface MediaGalleryProps {
    property: Property | null;
    style?: boolean; // Keep style prop if used
}

// --- Placeholder Image Data ---
// Replace this with actual data structure when backend provides images
const placeholder_gallery_data = {
    big_carousel: [
        "/assets/images/listing/img_43.jpg",
        "/assets/images/listing/img_44.jpg",
        "/assets/images/listing/img_45.jpg",
        "/assets/images/listing/img_46.jpg"
    ],
    small_carousel: [
        "/assets/images/listing/img_43_s.jpg",
        "/assets/images/listing/img_44_s.jpg",
        "/assets/images/listing/img_45_s.jpg",
        "/assets/images/listing/img_46_s.jpg"
    ],
    // IDs for fancybox links if needed separate from actual image URLs
    largeThumbIds: ["1", "2", "3"]
};
// --- End Placeholder ---


const MediaGallery: React.FC<MediaGalleryProps> = ({ property, style }) => {

    // State to manage the currently displayed image index
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // --- Determine Image Sources ---
    // Use property.images if available, otherwise fallback to placeholders
    // This assumes property.images = [{ largeUrl: '...', thumbnailUrl: '...' }, ...]
    // Adjust structure based on your actual Property interface image field
    const bigImages = property?.images?.map(img => img.largeUrl) || placeholder_gallery_data.big_carousel;
    const smallImages = property?.images?.map(img => img.thumbnailUrl) || placeholder_gallery_data.small_carousel;
    const largeThumbIdsForFancybox = property?.imageIdsForFancybox || placeholder_gallery_data.largeThumbIds; // Example

    // Reset index if property changes or images load
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [property]); // Reset when property object changes


    // --- Navigation Handlers ---
    const handleNext = () => {
        if (bigImages.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bigImages.length);
    };
    const handlePrev = () => {
        if (bigImages.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + bigImages.length) % bigImages.length);
    };

    // Handle case where there are no images
    if (bigImages.length === 0) {
        return (
            <div className="media-gallery mt-100 xl-mt-80 lg-mt-60">
                <p>No images available for this property.</p>
            </div>
        );
    }

    return (
        <div className="media-gallery mt-100 xl-mt-80 lg-mt-60">
            <div id="media_slider_details_1" className="carousel slide row"> {/* Unique ID */}
                <div className="col-lg-10">
                    <div className={`bg-white border-20 md-mb-20 ${style ? "" : "shadow4 p-30"}`}>
                        <div className="position-relative z-1 overflow-hidden border-20">
                            {/* Fancybox Trigger */}
                            {largeThumbIdsForFancybox && largeThumbIdsForFancybox.length > 0 && (
                                <div className="img-fancy-btn border-10 fw-500 fs-16 color-dark">
                                    See all {largeThumbIdsForFancybox.length} Photos
                                    <Fancybox options={{ Carousel: { infinite: true } }}>
                                        {/* Assume IDs map to large image URLs */}
                                        {largeThumbIdsForFancybox.map((thumbId: any, index: any) => (
                                            <a key={index} className="d-block" data-fancybox={`gallery-${property?._id || 'default'}`} href={`/assets/images/listing/img_large_0${thumbId}.jpg`}> {/* Adjust href based on actual large image path */}
                                            </a>
                                        ))}
                                    </Fancybox>
                                </div>
                            )}

                            {/* Main Image Display */}
                            <div className="carousel-inner">
                                {/* Display the currently selected image */}
                                <div className="carousel-item active">
                                    <img src={bigImages[currentImageIndex]} alt={`Property Image ${currentImageIndex + 1}`} className="w-100 border-20" />
                                </div>
                            </div>

                            {/* Carousel Controls */}
                            {bigImages.length > 1 && (
                                <>
                                    <button className="carousel-control-prev" type="button" onClick={handlePrev}>
                                        <i className="bi bi-chevron-left"></i>
                                        <span className="visually-hidden">Previous</span>
                                    </button>
                                    <button className="carousel-control-next" type="button" onClick={handleNext}>
                                        <i className="bi bi-chevron-right"></i>
                                        <span className="visually-hidden">Next</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thumbnail Navigation */}
                {smallImages.length > 1 && (
                    <div className="col-lg-2">
                        <div className={`nav nav-tabs carousel-indicators thumb-indicators-vertical position-relative p-15 w-100 h-100 ${style ? "" : "border-15 bg-white shadow4"}`}>
                            {smallImages.map((thumbUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    type="button"
                                    className={`nav-link ${index === currentImageIndex ? 'active' : ''}`}
                                    aria-current={index === currentImageIndex ? 'true' : 'false'} // Accessibility
                                    aria-label={`Slide ${index + 1}`} // Accessibility
                                >
                                    <img src={thumbUrl} alt={`Thumbnail ${index + 1}`} className="w-100 border-10" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaGallery;