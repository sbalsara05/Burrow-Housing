import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { Property } from '../../../redux/slices/propertySlice'; // Adjust the import path as needed

interface PropertyCarouselProps {
    item: Property;
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ item }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        arrows: false,
    };

    const images = item.images || [];

    if (images.length > 0) {
        return (
            <Slider {...settings}>
                {images.map((imgUrl, i) => (
                    <div key={i} className="carousel-item">
                        <Link to={`/listing_details_01/${item._id}`} className="d-block">
                            <img src={imgUrl} className="w-100" alt={item.overview.title || `Property Image ${i + 1}`} />
                        </Link>
                    </div>
                ))}
            </Slider>
        );
    }

    // Use a specific class for the placeholder
    return (
        <div className="carousel-item active">
            <Link to={`/listing_details_01/${item._id}`} className="d-block">
                <img 
                    src="/assets/images/listing/img_placeholder.jpg"
                    className="w-100 img-placeholder" 
                    alt="No image available" 
                />
            </Link>
        </div>
    );
};

export default PropertyCarousel;