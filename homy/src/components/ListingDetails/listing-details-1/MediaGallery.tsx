import React from "react";
import Fancybox from "../../common/Fancybox";
import { Property } from '../../../redux/slices/propertySlice';

interface MediaGalleryProps {
    property: Property | null;
    style?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ property, style }) => {
    const images = property?.images || [];
    const mainImage = images[0] || "/assets/images/listing/img_placeholder.jpg";
    const thumbImages = images.slice(1, 5);
    const totalPhotos = images.length || 1;

    if (!property) {
        // Render a loading or placeholder state if property is null
        return (
            <div className="media-gallery mt-100 xl-mt-80 lg-mt-60">
                <div className="row">
                    <div className="col-12">
                        <div className={`bg-white border-20 ${style ? "" : "shadow4 p-30"}`}>
                            <div className="media-gallery-main-image-container">
                                <img
                                    src="/assets/images/listing/img_placeholder.jpg"
                                    alt="Property images loading"
                                    className="w-100 border-20"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="media-gallery mt-100 xl-mt-80 lg-mt-60">
            <div className={`bg-white border-20 ${style ? "" : "shadow4 p-30"}`}>
                <Fancybox options={{ Carousel: { infinite: true } }}>
                    <div className="media-gallery-layout">
                        <div className="media-gallery-main-tile">
                            <img
                                src={mainImage}
                                alt={property?.overview?.title || "Property main image"}
                            />
                            <a
                                className="img-fancy-btn border-10 fw-500 fs-16 color-dark"
                                data-fancybox={`gallery-${property._id}`}
                                href={mainImage}
                            >
                                See all {totalPhotos} Photos
                            </a>
                            <a className="media-gallery-tile-link" data-fancybox={`gallery-${property._id}`} href={mainImage} aria-label="Open photo gallery"></a>
                        </div>

                        <div className="media-gallery-thumb-grid">
                            {thumbImages.map((thumbUrl, index) => (
                                <div key={thumbUrl + index} className="media-gallery-thumb-tile">
                                    <img src={thumbUrl} alt={`Property thumbnail ${index + 1}`} />
                                    {index === thumbImages.length - 1 && images.length > 5 && (
                                        <div className="media-gallery-thumb-overlay">
                                            +{images.length - 5}
                                        </div>
                                    )}
                                    <a className="media-gallery-tile-link" data-fancybox={`gallery-${property._id}`} href={thumbUrl} aria-label={`Open image ${index + 2}`}></a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {images.length > 5 ? (
                        images.slice(5).map((imgUrl, index) => (
                            <a key={index} className="d-block media-gallery-fancybox-anchor" data-fancybox={`gallery-${property._id}`} href={imgUrl}></a>
                        ))
                    ) : (
                        <></>
                    )}
                </Fancybox>
            </div>
        </div>
    );
};

export default MediaGallery;