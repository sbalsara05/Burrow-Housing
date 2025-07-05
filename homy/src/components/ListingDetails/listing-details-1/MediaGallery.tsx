import React, { useState, useEffect } from "react";
import Fancybox from "../../common/Fancybox";
import { Property } from '../../../redux/slices/propertySlice';

// Define the props interface
interface MediaGalleryProps {
    property: Property | null;
    style?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ property, style }) => {
    // State to manage the currently displayed image index
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Determine the image sources from the property prop
    const images = property?.images || [];

    // Reset index if the property (and thus its images) changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [property]);

    // Navigation Handlers
    const handleNext = () => {
        if (images.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        if (images.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    // --- RENDER LOGIC ---

    // Case 1: No property data or no images
    if (!property || images.length === 0) {
        return (
            <div className="media-gallery mt-100 xl-mt-80 lg-mt-60">
                <div className="row">
                    <div className="col-12">
                        <div className={`bg-white border-20 ${style ? "" : "shadow4 p-30"}`}>
                            <img
                                src="/assets/images/listing/img_placeholder.jpg" // A default placeholder image
                                alt="No property images available"
                                className="w-100 border-20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Case 2: Property has images
    return (
        <div className="media-gallery mt-100 xl-mt-80 lg-mt-60">
            <div id={`media_slider_${property._id}`} className="carousel slide row">
                <div className="col-lg-10">
                    <div className={`bg-white border-20 md-mb-20 ${style ? "" : "shadow4 p-30"}`}>
                        <div className="position-relative z-1 overflow-hidden border-20">
                            {/* Fancybox Trigger: Shows only if there are images */}
                            <div className="img-fancy-btn border-10 fw-500 fs-16 color-dark">
                                See all {images.length} Photos
                                <Fancybox
                                    options={{
                                        Carousel: { infinite: true },
                                    }}
                                >
                                    {images.map((imgUrl, index) => (
                                        <a key={index} className="d-block" data-fancybox={`gallery-${property._id}`} href={imgUrl}></a>
                                    ))}
                                </Fancybox>
                            </div>

                            {/* Main Image Display */}
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <img src={images[currentImageIndex]} alt={`Property Image ${currentImageIndex + 1}`} className="w-100 border-20" />
                                </div>
                            </div>

                            {/* Carousel Controls: Show only if more than one image */}
                            {images.length > 1 && (
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

                {/* Thumbnail Navigation: Show only if more than one image */}
                {images.length > 1 && (
                    <div className="col-lg-2">
                        <div className={`nav nav-tabs carousel-indicators thumb-indicators-vertical position-relative p-15 w-100 h-100 ${style ? "" : "border-15 bg-white shadow4"}`}>
                            {images.map((thumbUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    type="button"
                                    className={`nav-link ${index === currentImageIndex ? 'active' : ''}`}
                                    aria-current={index === currentImageIndex ? 'true' : 'false'}
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