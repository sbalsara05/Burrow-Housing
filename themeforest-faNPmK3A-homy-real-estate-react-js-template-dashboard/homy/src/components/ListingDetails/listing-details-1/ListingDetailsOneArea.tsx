import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import MediaGallery from "./MediaGallery";
import Sidebar from "./Sidebar";
import CommonBanner from "../listing-details-common/CommonBanner";
import CommonPropertyOverview from "../listing-details-common/CommonPropertyOverview";
import CommonPropertyFeatureList from "../listing-details-common/CommonPropertyFeatureList";
import CommonAmenities from "../listing-details-common/CommonAmenities";
import CommonPropertyVideoTour from "../listing-details-common/CommonPropertyVideoTour";
import CommonPropertyFloorPlan from "../listing-details-common/CommonPropertyFloorPlan";
import CommonNearbyList from "../listing-details-common/CommonNearbyList";
import CommonSimilarProperty from "../listing-details-common/CommonSimilarProperty";
import CommonProPertyScore from "../listing-details-common/CommonProPertyScore";
import CommonLocation from "../listing-details-common/CommonLocation";
import CommonReviewForm from "../listing-details-common/CommonReviewForm";
import NiceSelect from "../../../ui/NiceSelect";
import Review from "../../inner-pages/agency/agency-details/Review";

// Property interface based on the Mongoose model
interface PropertyType {
  _id: string;
  userId: string;
  overview: {
    category: string;
    roomType: string;
    neighborhood: string;
    rent: number;
  };
  listingDetails: {
    size: number;
    bedrooms: number;
    bathrooms: number;
    floorNo: number;
  };
  amenities: string[];
  addressAndLocation: {
    address: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  buildingName: string;
  leaseLength: string;
  description: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

const ListingDetailsOneArea = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState<string>("newest");

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        // Create a cancel token source
        const source = axios.CancelToken.source();

        // Set timeout of 45 seconds
        const timeoutId = setTimeout(() => {
          source.cancel("Request timed out after 45 seconds");
        }, 45000); // 45 seconds in milliseconds

        const response = await axios.get(`http://localhost:3000/api/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          cancelToken: source.token,
          timeout: 45000 // Also set axios timeout to 45 seconds
        });

        // Clear the timeout since request completed successfully
        clearTimeout(timeoutId);

        if (response.data && response.data.success) {
          setProperty(response.data.data);

          // Fetch property reviews (mock data for now)
          // In a real app, you'd fetch reviews from your API
          setReviews([
            {
              id: 1,
              name: "Zubayer Al Hasan",
              date: "17 Aug, 2023",
              rating: 4.7,
              comment: "Great location and amenities. The apartment was clean and well-maintained."
            },
            {
              id: 2,
              name: "Rashed Kabir",
              date: "13 Aug, 2023",
              rating: 4.9,
              comment: "Excellent property and very responsive landlord. Would definitely recommend."
            }
          ]);
        } else {
          setError("Failed to load property details");
          toast.error("Failed to load property details");
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        setError("An error occurred while fetching property details");
        toast.error("An error occurred while fetching property details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const selectHandler = (value: string) => {
    setSortOption(value);
    // Sort reviews based on selected option
    const sortedReviews = [...reviews];
    if (value === "newest") {
      sortedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (value === "highest") {
      sortedReviews.sort((a, b) => b.rating - a.rating);
    } else if (value === "lowest") {
      sortedReviews.sort((a, b) => a.rating - b.rating);
    }
    setReviews(sortedReviews);
  };

  if (loading) {
    return (
      <div className="listing-details-one theme-details-one bg-pink pt-180 lg-pt-150 pb-150 xl-pb-120">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="listing-details-one theme-details-one bg-pink pt-180 lg-pt-150 pb-150 xl-pb-120">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {error || "Property not found"}
          </div>
        </div>
      </div>
    );
  }

  // Prepare amenities for the CommonAmenities component
  const propertyAmenities = property.amenities.map(amenity => ({
    id: amenity.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: amenity
  }));

  return (
    <div className="listing-details-one theme-details-one bg-pink pt-180 lg-pt-150 pb-150 xl-pb-120">
      <div className="container">
        {/* Banner with property title and address */}
        <div className="page-title-one">
          <h2 className="title">{property.buildingName || `${property.listingDetails.bedrooms} Bedroom in ${property.overview.neighborhood}`}</h2>
          <div className="d-flex align-items-center">
            <div className="property-feature d-flex align-items-center me-4">
              <img src="/assets/images/icon/icon_42.svg" alt="" className="lazy-img icon me-2" />
              <span className="fs-16">{property.overview.neighborhood}</span>
            </div>
            <div className="location">
              <i className="fa-light fa-location-dot"></i>
              <span>{property.addressAndLocation.address}</span>
            </div>
          </div>
        </div>

        {/* Property Images Gallery */}
        <div className="row mt-50">
          <div className="col-12">
            <div className="media-gallery">
              {property.images && property.images.length > 0 ? (
                <div className="row g-4">
                  <div className="col-md-8">
                    <div className="main-img">
                      <a href={property.images[0]} data-fancybox="gallery" className="d-block">
                        <img src={property.images[0]} alt="Property" className="w-100 border-5" />
                      </a>
                    </div>
                  </div>
                  <div className="col-md-4 d-flex flex-column">
                    {property.images.slice(1, 3).map((img, index) => (
                      <div key={index} className={`image-grid flex-fill mb-${index === 0 ? '4' : '0'}`}>
                        <a href={img} data-fancybox="gallery" className="d-block h-100">
                          <img src={img} alt="Property" className="w-100 h-100 border-5" style={{ objectFit: 'cover' }} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="placeholder-gallery border-5 bg-light d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                  <p className="text-muted">No images available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Overview (Quick Stats) */}
        <div className="property-feature-list bg-white shadow4 border-20 p-40 mt-50 mb-60">
          <h4 className="sub-title-one mb-40 lg-mb-20">Property Overview</h4>
          <div className="row">
            <div className="col-md-3 col-6">
              <div className="feature-block d-flex align-items-center mb-30">
                <div className="icon"><img src="/assets/images/icon/icon_36.svg" alt="" className="lazy-img" /></div>
                <div className="ps-3">
                  <div className="title">Bedroom</div>
                  <div className="info">{property.listingDetails.bedrooms}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="feature-block d-flex align-items-center mb-30">
                <div className="icon"><img src="/assets/images/icon/icon_37.svg" alt="" className="lazy-img" /></div>
                <div className="ps-3">
                  <div className="title">Bathroom</div>
                  <div className="info">{property.listingDetails.bathrooms}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="feature-block d-flex align-items-center mb-30">
                <div className="icon"><img src="/assets/images/icon/icon_38.svg" alt="" className="lazy-img" /></div>
                <div className="ps-3">
                  <div className="title">Square Feet</div>
                  <div className="info">{property.listingDetails.size || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="feature-block d-flex align-items-center mb-30">
                <div className="icon"><img src="/assets/images/icon/icon_39.svg" alt="" className="lazy-img" /></div>
                <div className="ps-3">
                  <div className="title">Floor</div>
                  <div className="info">{property.listingDetails.floorNo}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-8">
            {/* Property Description */}
            <div className="property-overview mb-50 bg-white shadow4 border-20 p-40">
              <h4 className="mb-20">Overview</h4>
              <p className="fs-20 lh-lg">{property.description}</p>
            </div>

            {/* Property Details */}
            <div className="property-feature-accordion bg-white shadow4 border-20 p-40 mb-50">
              <h4 className="mb-20">Property Details</h4>
              <p className="fs-20 lh-lg">Detailed information about this {property.overview.category.toLowerCase()}.</p>
              <div className="accordion-style-two mt-45">
                <div className="accordion" id="propertyDetails">
                  <div className="accordion-item">
                    <div className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                        Basic Information
                      </button>
                    </div>
                    <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#propertyDetails">
                      <div className="accordion-body">
                        <ul className="property-feature-list style-none">
                          <li>
                            <span>Property Type:</span>
                            <span>{property.overview.category}</span>
                          </li>
                          <li>
                            <span>Room Type:</span>
                            <span>{property.overview.roomType}</span>
                          </li>
                          <li>
                            <span>Rent:</span>
                            <span>${property.overview.rent}/month</span>
                          </li>
                          <li>
                            <span>Lease Length:</span>
                            <span>{property.leaseLength}</span>
                          </li>
                          <li>
                            <span>Bedrooms:</span>
                            <span>{property.listingDetails.bedrooms}</span>
                          </li>
                          <li>
                            <span>Bathrooms:</span>
                            <span>{property.listingDetails.bathrooms}</span>
                          </li>
                          <li>
                            <span>Square Feet:</span>
                            <span>{property.listingDetails.size || 'N/A'}</span>
                          </li>
                          <li>
                            <span>Floor:</span>
                            <span>{property.listingDetails.floorNo}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Amenities */}
            <div className="property-amenities bg-white shadow4 border-20 p-40 mb-50">
              <h4 className="mb-20">Amenities</h4>
              <div className="mt-25">
                <div className="row">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="col-lg-4 col-md-6">
                      <div className="amenities-block d-flex align-items-center mb-20">
                        <div className="icon"><i className="fa-solid fa-check"></i></div>
                        <div className="ps-2 text">{amenity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="property-location mb-50">
              <h4 className="mb-20">Location</h4>
              <div className="bg-white shadow4 border-20 p-40">
                <div className="row">
                  <div className="col-12">
                    <div className="location-map">
                      {property.location ? (
                        <iframe
                          className="gmap_iframe h-400 w-100"
                          src={`https://www.google.com/maps/embed/v1/place?q=${property.addressAndLocation.address}&key=AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ`}
                          title="Property Location"
                          width="100%"
                          height="400"
                          style={{ border: 0 }}
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="placeholder-map d-flex align-items-center justify-content-center bg-light" style={{ height: '400px' }}>
                          <p className="text-muted">No map location available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            <div className="similar-properties mb-50">
              <h4 className="mb-20">Similar Listings</h4>
              <CommonSimilarProperty neighborhood={property.overview.neighborhood} />
            </div>

            {/* Reviews Section */}
            <div className="review-panel-one bg-white shadow4 border-20 p-40 mb-50">
              <div className="position-relative z-1">
                <div className="d-sm-flex justify-content-between align-items-center mb-30">
                  <h4 className="m0 xs-pb-30">Reviews</h4>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "newest", text: "Newest" },
                      { value: "highest", text: "Highest Rating" },
                      { value: "lowest", text: "Lowest Rating" },
                    ]}
                    defaultCurrent={0}
                    onChange={selectHandler}
                    name=""
                    placeholder=""
                  />
                </div>

                {reviews.length > 0 ? (
                  <div className="review-wrapper">
                    {reviews.map((review) => (
                      <div key={review.id} className="review mb-40 pb-40 border-bottom">
                        <div className="d-flex">
                          <div className="user-avatar">
                            <img src={`/assets/images/media/img_0${review.id % 3 + 1}.jpg`} alt="" className="rounded-circle avatar" />
                          </div>
                          <div className="review-content ps-3">
                            <div className="d-flex justify-content-between">
                              <div>
                                <h6 className="name">{review.name}</h6>
                                <div className="time fs-16">{review.date}</div>
                              </div>
                              <ul className="rating d-flex style-none">
                                <li><span className="fst-italic me-2">({review.rating} Rating)</span></li>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <li key={star}>
                                    <i className={`fa-solid fa-star ${star <= review.rating ? 'active' : ''}`}></i>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="fs-18 mt-20">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No reviews yet. Be the first to review this property.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Form */}
            <div className="review-form bg-white shadow4 border-20 p-40">
              <h4 className="mb-30">Write a Review</h4>
              <form className="review-form-element">
                <div className="row">
                  <div className="col-md-6">
                    <div className="dash-input-wrapper mb-25">
                      <label htmlFor="name">Your Name*</label>
                      <input type="text" placeholder="Your Name" id="name" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="dash-input-wrapper mb-25">
                      <label htmlFor="email">Your Email*</label>
                      <input type="email" placeholder="Your Email" id="email" />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                      <label htmlFor="rating">Your Rating*</label>
                      <div className="rating-input d-flex align-items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <input key={star} type="radio" name="rating" id={`rating-${star}`} value={star} />
                        ))}
                        <div className="fs-16 fw-500 ms-2">(0)</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                      <label htmlFor="review">Your Review*</label>
                      <textarea placeholder="Write your review here..." id="review"></textarea>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-six tran3s">Submit Review</button>
              </form>
            </div>
          </div>

          {/* Sidebar with contact, schedule visit, and more */}
          <div className="col-xl-4">
            <div className="sidebar-area ms-xl-5">
              {/* Contact Card */}
              <div className="bg-white shadow4 border-20 p-30 sticky-md-top">
                <div className="price-details text-center mb-20">
                  <div className="price fw-500">${property.overview.rent}<sub>/mo</sub></div>
                </div>

                <div className="contact-info-block d-flex align-items-center mb-20">
                  <div className="icon rounded-circle d-flex align-items-center justify-content-center">
                    <i className="bi bi-person"></i>
                  </div>
                  <div className="ps-4">
                    <span className="d-block fs-16">Listed by</span>
                    <a href="#" className="name fw-500 tran3s">Property Owner</a>
                  </div>
                </div>

                {/* Contact Form */}
                <form action="#" className="contact-form">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="input-wrapper">
                        <input type="text" className="form-control" placeholder="Your name*" />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="input-wrapper">
                        <input type="email" className="form-control" placeholder="Your email*" />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="input-wrapper">
                        <input type="tel" className="form-control" placeholder="Phone*" />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="input-wrapper">
                        <textarea className="form-control" placeholder="Message*"></textarea>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn-six w-100 fw-500 tran3s mt-4">Send Message</button>
                </form>

                {/* Schedule Visit Section */}
                <div className="schedule-visit-btn d-block position-relative text-center mt-30 mb-10">
                  <a href="#" className="d-block fw-500 tran3s">
                    <i className="fa-regular fa-calendar-days me-2"></i>Schedule Visit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsOneArea;