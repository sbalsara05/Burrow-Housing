import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import DropdownSeven from "../../search-dropdown/inner-dropdown/DropdownSeven";
import { Link } from "react-router-dom";
import NiceSelect from "../../../ui/NiceSelect";
import Fancybox from "../../common/Fancybox";
import axios from "axios";
import { toast } from "react-toastify";

// Define property interface based on your Mongoose model
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
  buildingName?: string;
  leaseLength: string;
  description: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Frontend property display type
interface DisplayProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  price_text?: string;
  tag: string;
  tag_bg?: string;
  thumb: string;
  carousel_thumb: { id: number }[];
  property_info: {
    sqft: number;
    bed: number;
    bath: number;
  };
}

const ListingFourteenArea = () => {
  // State for properties and pagination
  const [properties, setProperties] = useState<DisplayProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<DisplayProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [itemOffset, setItemOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState<DisplayProperty[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const itemsPerPage = 4;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(null);
  const [selectedBathrooms, setSelectedBathrooms] = useState<number | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("All");
  const [sortOption, setSortOption] = useState("newest");

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        // Create a cancel token source for timeout
        const source = axios.CancelToken.source();

        // Set timeout of 45 seconds
        const timeoutId = setTimeout(() => {
          source.cancel("Request timed out after 45 seconds");
        }, 45000);

        const response = await axios.get("http://localhost:3000/api/properties/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          cancelToken: source.token,
          timeout: 45000
        });

        // Clear the timeout since request completed successfully
        clearTimeout(timeoutId);

        // Check if we have a valid response with properties
        if (response.data && response.data.properties) {
          // Map backend properties to frontend display format
          const mappedProperties = response.data.properties.map((property: PropertyType) => ({
            id: property._id,
            title: property.buildingName || `${property.listingDetails.bedrooms} Bed in ${property.overview.neighborhood}`,
            address: property.addressAndLocation.address,
            price: property.overview.rent,
            price_text: "mo", // All properties are monthly based on the data
            tag: property.overview.category,
            tag_bg: property.overview.category === "Single Room" ? "bg-blue" : property.overview.category === "Apartment" ? "bg-orange" : "",
            thumb: property.images && property.images.length > 0
              ? property.images[0]
              : "/assets/images/listing/img_09.jpg",
            carousel_thumb: property.images
              ? property.images.slice(0, 3).map((_, index) => ({ id: index + 1 }))
              : [{ id: 1 }, { id: 2 }, { id: 3 }],
            property_info: {
              sqft: property.listingDetails.size || 0,
              bed: property.listingDetails.bedrooms,
              bath: property.listingDetails.bathrooms
            }
          }));

          setProperties(mappedProperties);
          setFilteredProperties(mappedProperties);

          // Calculate max price for filter
          const maxPropertyPrice = Math.max(...mappedProperties.map(property => property.price), 5000);
          setPriceRange([0, maxPropertyPrice]);
        } else {
          console.error("Unexpected API response structure:", response.data);
          setError("Failed to load properties. Unexpected response format.");
          toast.error("Failed to load properties. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        if (axios.isCancel(error)) {
          setError("Request timed out. Please try again later.");
          toast.error("Request timed out after 45 seconds");
        } else {
          setError("Failed to load properties");
          toast.error("An error occurred while fetching properties");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Apply filters and update pagination
  useEffect(() => {
    // Filter properties based on search and filter criteria
    let result = [...properties];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply bedroom filter
    if (selectedBedrooms !== null) {
      result = result.filter(
        (property) => property.property_info.bed === selectedBedrooms
      );
    }

    // Apply bathroom filter
    if (selectedBathrooms !== null) {
      result = result.filter(
        (property) => property.property_info.bath === selectedBathrooms
      );
    }

    // Apply neighborhood filter
    if (selectedNeighborhood) {
      result = result.filter(
        (property) => property.address.includes(selectedNeighborhood)
      );
    }

    // Apply price range filter
    result = result.filter(
      (property) =>
        property.price >= priceRange[0] &&
        property.price <= priceRange[1]
    );

    // Apply property type filter
    if (selectedType !== "All") {
      result = result.filter((property) => property.tag === selectedType);
    }

    // Apply sorting
    switch (sortOption) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // Assuming newer properties have higher IDs
        result.sort((a, b) => a.id > b.id ? -1 : 1);
        break;
    }

    setFilteredProperties(result);
  }, [
    properties,
    searchTerm,
    selectedBedrooms,
    selectedBathrooms,
    selectedNeighborhood,
    priceRange,
    selectedType,
    sortOption,
    selectedAmenities
  ]);

  // Update pagination when filtered properties change
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredProperties.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredProperties.length / itemsPerPage));
  }, [filteredProperties, itemOffset, itemsPerPage]);

  // Handle page click
  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % filteredProperties.length;
    setItemOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setItemOffset(0); // Reset to first page
  };

  const handleBedroomChange = (value: number | null) => {
    setSelectedBedrooms(value);
    setItemOffset(0);
  };

  const handleBathroomChange = (value: number | null) => {
    setSelectedBathrooms(value);
    setItemOffset(0);
  };

  const handlePriceChange = (values: [number, number]) => {
    setPriceRange(values);
    setItemOffset(0);
  };

  const handleLocationChange = (value: string) => {
    setSelectedNeighborhood(value);
    setItemOffset(0);
  };

  const handleAmenityChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, value]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(item => item !== value));
    }
    setItemOffset(0);
  };

  const handleTypeChange = (value: string) => {
    setSortOption(value);
    setItemOffset(0);
  };

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    setItemOffset(0);
  };

  const handlePriceDropChange = (value: any) => {
    // This could be used for specific price drop filters
    console.log("Price drop filter:", value);
  };

  const handleStatusChange = (value: string) => {
    // This could be used for filtering by status (e.g., available, rented)
    console.log("Status filter:", value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedBedrooms(null);
    setSelectedBathrooms(null);
    setPriceRange([0, Math.max(...properties.map(property => property.price), 5000)]);
    setSelectedNeighborhood("");
    setSelectedAmenities([]);
    setSelectedType("All");
    setSortOption("newest");
    setItemOffset(0);
  };

  // Calculate max price for the slider
  const maxPrice = Math.max(...properties.map(property => property.price), 5000);

  // Loading state
  if (loading) {
    return (
      <div className="property-listing-eight pt-150 xl-pt-120">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading properties...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="property-listing-eight pt-150 xl-pt-120">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-listing-eight pt-150 xl-pt-120">
      <div className="search-wrapper-three layout-two position-relative">
        <div className="bg-wrapper rounded-0 border-0">
          <DropdownSeven
            handlePriceDropChange={handlePriceDropChange}
            handleSearchChange={handleSearchChange}
            handleBedroomChange={handleBedroomChange}
            handleBathroomChange={handleBathroomChange}
            handlePriceChange={handlePriceChange}
            maxPrice={maxPrice}
            priceValue={priceRange}
            handleResetFilter={resetFilters}
            selectedAmenities={selectedAmenities}
            handleAmenityChange={handleAmenityChange}
            handleLocationChange={handleLocationChange}
            handleStatusChange={handleStatusChange}
          />
        </div>
      </div>

      <div className="row gx-0">
        <div className="col-xxl-6 col-lg-5">
          <div id="google-map-area" className="h-100">
            <div className="google-map-home" id="contact-google-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24197.744039446983!2d-71.06779201358089!3d42.337632280599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e3652d0d3d311b%3A0x787cbf240162e8a0!2sBoston%2C%20MA%2C%20USA!5e0!3m2!1sen!2sbd!4v1699764452737!5m2!1sen!2sbd"
                width="600" height="450" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" className="w-100 h-100">
              </iframe>
            </div>
          </div>
        </div>

        <div className="col-xxl-6 col-lg-7">
          <div className="bg-light pl-40 pr-40 pt-35 pb-60">
            <div className="listing-header-filter d-sm-flex justify-content-between align-items-center mb-40 lg-mb-30">
              <div>
                Showing <span className="color-dark fw-500">{itemOffset + 1}–{Math.min(itemOffset + currentItems.length, filteredProperties.length)}</span> of{" "}
                <span className="color-dark fw-500">{filteredProperties.length}</span> results
              </div>
              <div className="d-flex align-items-center xs-mt-20">
                <div className="short-filter d-flex align-items-center">
                  <div className="fs-16 me-2">Sort by:</div>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "newest", text: "Newest" },
                      { value: "price_low", text: "Price Low" },
                      { value: "price_high", text: "Price High" },
                    ]}
                    defaultCurrent={0}
                    onChange={handleTypeChange}
                    name=""
                    placeholder=""
                  />
                </div>
                <Link
                  to="/listing_15"
                  className="tran3s layout-change rounded-circle ms-auto ms-sm-3"
                  data-bs-toggle="tooltip"
                  title="Switch To List View"
                >
                  <i className="fa-regular fa-bars"></i>
                </Link>
              </div>
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-5 my-4 bg-white rounded-4 border">
                <div className="mb-3">
                  <i className="fa-regular fa-face-frown fa-3x text-muted"></i>
                </div>
                <h4>No properties found</h4>
                <p className="text-muted mb-4">Try adjusting your search filters</p>
                <button
                  className="btn-six tran3s"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="row">
                {currentItems.map((item) => (
                  <div key={item.id} className="col-md-6 d-flex mb-40">
                    <div className="listing-card-one style-three border-30 w-100 h-100">
                      <div className="img-gallery p-15">
                        <div className="position-relative border-20 overflow-hidden">
                          <div className="tag bg-white text-dark fw-500 border-20">{item.tag}</div>
                          <img
                            src={item.thumb || "/assets/images/listing/img_09.jpg"}
                            className="w-100 border-20"
                            alt={item.title}
                            style={{ height: "220px", objectFit: "cover" }}
                          />
                          <Link
                            to={`/listing_details/${item.id}`}
                            className="btn-four inverse rounded-circle position-absolute"
                          >
                            <i className="bi bi-arrow-up-right"></i>
                          </Link>
                          {item.carousel_thumb && item.carousel_thumb.length > 0 && (
                            <div className="img-slider-btn">
                              {item.carousel_thumb.length} <i className="fa-regular fa-image"></i>
                              <Fancybox
                                options={{
                                  Carousel: {
                                    infinite: true,
                                  },
                                }}
                              >
                                {item.carousel_thumb.map((thumb, index) => (
                                  <a
                                    key={index}
                                    className="d-block"
                                    data-fancybox="gallery5"
                                    href={item.thumb || `/assets/images/listing/img_large_0${thumb.id}.jpg`}
                                  ></a>
                                ))}
                              </Fancybox>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="property-info pe-4 ps-4">
                        <Link to={`/listing_details/${item.id}`} className="title tran3s">
                          {item.title}
                        </Link>
                        <div className="address">
                          <i className="fa-light fa-location-dot me-2"></i>
                          {item.address}
                        </div>
                        <div className="pl-footer m0 d-flex align-items-center justify-content-between mt-3">
                          <strong className="price fw-500 color-dark">
                            ${item.price.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                            {item.price_text && (
                              <>
                                /<sub>{item.price_text}</sub>
                              </>
                            )}
                          </strong>
                          <ul className="style-none d-flex action-icons">
                            <li>
                              <Link to="#" title="Add to favorites">
                                <i className="fa-light fa-heart"></i>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" title="Save">
                                <i className="fa-light fa-bookmark"></i>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" title="Compare">
                                <i className="fa-light fa-circle-plus"></i>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pageCount > 1 && (
              <div className="pt-5">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<i className="fa-regular fa-chevron-right"></i>}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={2}
                  marginPagesDisplayed={1}
                  pageCount={pageCount}
                  previousLabel={<i className="fa-regular fa-chevron-left"></i>}
                  renderOnZeroPageCount={null}
                  className="pagination-two d-inline-flex align-items-center justify-content-center style-none"
                  activeClassName="active"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingFourteenArea;