import React, {useEffect, useState} from 'react';
import ReactPaginate from "react-paginate";
import {useDispatch, useSelector} from 'react-redux';
import {Link, useLocation, useSearchParams} from 'react-router-dom'; // Added useLocation, useSearchParams
import {createSelector, PayloadAction} from '@reduxjs/toolkit';
import store, {AppDispatch} from "../../../redux/slices/store"
import {toast} from 'react-toastify';

// Redux imports (adjust paths as needed)
import {
    fetchAllPublicProperties,
    selectAllPublicProperties,
    selectPublicPagination,
    selectPropertyLoading,
    selectPropertyError,
    clearPropertyError,
    Property,
    selectPropertyStatus
} from '../../../redux/slices/propertySlice';

import {
    selectAmenities,
    selectApiFormattedFilters, selectFilters, selectMaxPriceForSlider, selectPriceRangeValues, selectSortBy,
    setBathrooms,
    setBedrooms,
    setCategory,
    setNeighborhood, setPriceRangeValues, setRentRange, setRoomType,
    setSearchTerm, setSqftMax, setSqftMin, toggleAmenity,
    resetFilters // Import the correct action name
    // ... your other filter imports
} from '../../../redux/slices/filterSlice';

// Import favorites functionality
import {
    addToFavorites,
    removeFromFavorites,
    fetchFavorites,
    selectFavoriteIds,
    selectFavoritesLoading,
    selectIsPropertyFavorited
} from '../../../redux/slices/favoritesSlice';

// Auth selector
import {selectIsAuthenticated} from '../../../redux/slices/authSlice';

// Component imports (adjust paths as needed)
import DropdownSeven from "../../search-dropdown/inner-dropdown/DropdownSeven";
import NiceSelect from "../../../ui/NiceSelect";
import PropertyMap from './propertyMap';
import PropertyCarousel from '../../homes/home/PropertyCarousel';

const ITEMS_PER_PAGE = 4;

// Client-Side Sorting Logic (updated to use imported Property type)
const selectSortedPublicProperties = createSelector(
    [selectAllPublicProperties, selectSortBy],
    (properties: Property[], sortBy) => {
        if (!properties || !Array.isArray(properties)) {
            return [];
        }

        const sorted = [...properties];
        switch (sortBy) {
            case 'price_low':
                sorted.sort((a, b) => a.overview.rent - b.overview.rent);
                break;
            case 'price_high':
                sorted.sort((a, b) => b.overview.rent - a.overview.rent);
                break;
            case 'newest':
            default:
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        return sorted;
    }
);

const ListingFourteenArea = () => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation(); // Added for URL/navigation state
    const [searchParams] = useSearchParams(); // Added for URL parameters

    // Redux state
    const properties = useSelector(selectAllPublicProperties) || [];
    const pagination = useSelector(selectPublicPagination);
    const isLoading = useSelector(selectPropertyLoading);
    const error = useSelector(selectPropertyError);
    const filters = useSelector(selectFilters);
    const apiFormattedFilters = useSelector(selectApiFormattedFilters);
    const sortBy = useSelector(selectSortBy) || 'newest';
    const maxPriceForSlider = useSelector(selectMaxPriceForSlider);
    const currentPriceRangeValues = useSelector(selectPriceRangeValues) || [0, 10000];
    const currentAmenities = useSelector(selectAmenities) || [];
    const propertyStatus = useSelector(selectPropertyStatus);

    // Favorites state
    const favoriteIds = useSelector(selectFavoriteIds) || [];
    const favoritesLoading = useSelector(selectFavoritesLoading);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Get sorted properties
    const sortedProperties = useSelector(selectSortedPublicProperties);

    // Local state for property selection (simpler approach)
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
    const [hoveredPropertyId, setHoveredPropertyId] = useState<string | undefined>();
    const [filtersInitialized, setFiltersInitialized] = useState(false); // Track if filters have been initialized

    // NEW: Initialize filters from URL parameters or navigation state
    useEffect(() => {
        console.log('🔍 Initializing filters from URL/navigation...');
        let shouldUpdateFilters = false;

        // Check if we have URL parameters
        const categoryFromUrl = searchParams.get('category');
        const roomTypeFromUrl = searchParams.get('roomType');
        const neighborhoodFromUrl = searchParams.get('neighborhood');
        const rentRangeFromUrl = searchParams.get('rentRange');
        const bedroomsFromUrl = searchParams.get('bedrooms');
        const bathroomsFromUrl = searchParams.get('bathrooms');
        const searchTermFromUrl = searchParams.get('search');
        const amenitiesFromUrl = searchParams.get('amenities');

        console.log('📋 URL Parameters:', {
            category: categoryFromUrl,
            roomType: roomTypeFromUrl,
            neighborhood: neighborhoodFromUrl,
            rentRange: rentRangeFromUrl,
            bedrooms: bedroomsFromUrl,
            bathrooms: bathroomsFromUrl,
            search: searchTermFromUrl,
            amenities: amenitiesFromUrl
        });

        // Check if we have state passed from navigation (from home page)
        const navigationState = location.state as any;
        console.log('🧭 Navigation State:', navigationState);

        // Initialize filters from URL params (URL params take priority)
        if (categoryFromUrl && categoryFromUrl !== filters.category) {
            console.log('🏷️ Setting category from URL:', categoryFromUrl);
            dispatch(setCategory(categoryFromUrl === 'all' ? null : categoryFromUrl));
            shouldUpdateFilters = true;
        }

        if (roomTypeFromUrl && roomTypeFromUrl !== filters.roomType) {
            console.log('🏠 Setting room type from URL:', roomTypeFromUrl);
            dispatch(setRoomType(roomTypeFromUrl === 'all' ? null : roomTypeFromUrl));
            shouldUpdateFilters = true;
        }

        if (neighborhoodFromUrl && neighborhoodFromUrl !== filters.neighborhood) {
            console.log('📍 Setting neighborhood from URL:', neighborhoodFromUrl);
            dispatch(setNeighborhood(neighborhoodFromUrl === 'any' ? 'Any' : neighborhoodFromUrl));
            shouldUpdateFilters = true;
        }

        if (rentRangeFromUrl && rentRangeFromUrl !== filters.rentRange) {
            console.log('💰 Setting rent range from URL:', rentRangeFromUrl);
            dispatch(setRentRange(rentRangeFromUrl === 'any' ? null : rentRangeFromUrl));
            shouldUpdateFilters = true;
        }

        if (bedroomsFromUrl && bedroomsFromUrl !== filters.bedrooms) {
            console.log('🛏️ Setting bedrooms from URL:', bedroomsFromUrl);
            dispatch(setBedrooms(bedroomsFromUrl));
            shouldUpdateFilters = true;
        }

        if (bathroomsFromUrl && bathroomsFromUrl !== filters.bathrooms) {
            console.log('🚿 Setting bathrooms from URL:', bathroomsFromUrl);
            dispatch(setBathrooms(bathroomsFromUrl));
            shouldUpdateFilters = true;
        }

        if (searchTermFromUrl && searchTermFromUrl !== filters.searchTerm) {
            console.log('🔍 Setting search term from URL:', searchTermFromUrl);
            dispatch(setSearchTerm(searchTermFromUrl));
            shouldUpdateFilters = true;
        }

        // Handle amenities (comma-separated string)
        if (amenitiesFromUrl) {
            const amenitiesArray = amenitiesFromUrl.split(',').filter(Boolean);
            console.log('✨ Setting amenities from URL:', amenitiesArray);

            // Reset current amenities and set new ones
            const currentAmenitiesState = filters.amenities || [];
            for (const amenity of currentAmenitiesState) {
                dispatch(toggleAmenity(amenity)); // Remove existing
            }
            for (const amenity of amenitiesArray) {
                dispatch(toggleAmenity(amenity)); // Add new
            }
            shouldUpdateFilters = true;
        }

        // Initialize from navigation state if no URL params (fallback)
        if (!shouldUpdateFilters && navigationState?.filters) {
            console.log('📦 Using navigation state filters:', navigationState.filters);
            const navFilters = navigationState.filters;

            if (navFilters.category && navFilters.category !== filters.category) {
                dispatch(setCategory(navFilters.category));
                shouldUpdateFilters = true;
            }
            if (navFilters.roomType && navFilters.roomType !== filters.roomType) {
                dispatch(setRoomType(navFilters.roomType));
                shouldUpdateFilters = true;
            }
            if (navFilters.neighborhood && navFilters.neighborhood !== filters.neighborhood) {
                dispatch(setNeighborhood(navFilters.neighborhood));
                shouldUpdateFilters = true;
            }
            if (navFilters.rentRange && navFilters.rentRange !== filters.rentRange) {
                dispatch(setRentRange(navFilters.rentRange));
                shouldUpdateFilters = true;
            }
            if (navFilters.bedrooms && navFilters.bedrooms !== filters.bedrooms) {
                dispatch(setBedrooms(navFilters.bedrooms));
                shouldUpdateFilters = true;
            }
            if (navFilters.bathrooms && navFilters.bathrooms !== filters.bathrooms) {
                dispatch(setBathrooms(navFilters.bathrooms));
                shouldUpdateFilters = true;
            }
            if (navFilters.searchTerm && navFilters.searchTerm !== filters.searchTerm) {
                dispatch(setSearchTerm(navFilters.searchTerm));
                shouldUpdateFilters = true;
            }
            if (navFilters.amenities && navFilters.amenities.length > 0) {
                // Reset and set amenities
                const currentAmenitiesState = filters.amenities || [];
                for (const amenity of currentAmenitiesState) {
                    dispatch(toggleAmenity(amenity));
                }
                for (const amenity of navFilters.amenities) {
                    dispatch(toggleAmenity(amenity));
                }
                shouldUpdateFilters = true;
            }
        }

        // Mark filters as initialized and trigger fetch if needed
        if (shouldUpdateFilters || !filtersInitialized) {
            console.log('🚀 Triggering fetch with updated filters...');
            setFiltersInitialized(true);

            // Use setTimeout to ensure Redux state is updated
            setTimeout(() => {
                const updatedApiFilters = selectApiFormattedFilters(store.getState());
                console.log('📤 Fetching with filters:', updatedApiFilters);
                dispatch(fetchAllPublicProperties({page: 1, limit: ITEMS_PER_PAGE, ...updatedApiFilters}));
            }, 100);
        } else {
            setFiltersInitialized(true);
        }
    }, [location.search, location.state, dispatch]); // Re-run when URL or navigation state changes

    // Fetch favorites when component mounts (if authenticated)
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchFavorites());
        }
    }, [dispatch, isAuthenticated]);

    // Handle property selection from map
    const handlePropertySelect = (property: Property) => {
        setSelectedPropertyId(property._id);
        // Scroll to property card
        const cardElement = document.getElementById(`property-card-${property._id}`);
        if (cardElement) {
            cardElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    // Handle property hover from cards
    const handlePropertyHover = (propertyId: string, isHovered: boolean) => {
        setHoveredPropertyId(isHovered ? propertyId : undefined);
    };

    // Handle favorite toggle
    const handleFavoriteToggle = async (propertyId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to add favorites');
            return;
        }

        try {
            const isFavorited = favoriteIds.includes(propertyId);

            if (isFavorited) {
                await dispatch(removeFromFavorites(propertyId)).unwrap();
                toast.success('Removed from favorites');
            } else {
                await dispatch(addToFavorites(propertyId)).unwrap();
                toast.success('Added to favorites');
            }
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    // Get property stats (simple version)
    const getPropertyStats = (properties: Property[]) => {
        const stats = {
            total: properties.length,
            affordable: 0,
            midRange: 0,
            expensive: 0,
            averagePrice: 0
        };

        if (properties.length === 0) return stats;

        let totalPrice = 0;

        properties.forEach(property => {
            const price = property.overview.rent;
            totalPrice += price;

            if (price <= 2000) {
                stats.affordable++;
            } else if (price <= 3000) {
                stats.midRange++;
            } else {
                stats.expensive++;
            }
        });

        stats.averagePrice = Math.round(totalPrice / properties.length);
        return stats;
    };

    // Modified initial load effect - only run if filters are initialized and no properties loaded
    useEffect(() => {
        dispatch(clearPropertyError());

        // Only fetch if filters are initialized and we haven't loaded properties yet
        if (filtersInitialized &&
            (propertyStatus === 'idle' || propertyStatus === 'failed') &&
            properties.length === 0 &&
            !isLoading) {
            console.log('🔄 Initial fetch with current filters:', apiFormattedFilters);
            dispatch(fetchAllPublicProperties({page: 1, limit: ITEMS_PER_PAGE, ...apiFormattedFilters}));
        }
    }, [dispatch, propertyStatus, properties.length, isLoading, apiFormattedFilters, filtersInitialized]);

    // Pagination handler
    const handlePageClick = (event: { selected: number }) => {
        const newPage = event.selected + 1;
        console.log(`Loading page ${newPage}`);
        dispatch(fetchAllPublicProperties({page: newPage, limit: ITEMS_PER_PAGE, ...apiFormattedFilters}));
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    // Filter update and refetch logic
    const updateFilterAndRefetch = (filterAction: PayloadAction<any>) => {
        dispatch(filterAction);
        setTimeout(() => {
            const latestState = store.getState();
            const updatedApiFilters = selectApiFormattedFilters(latestState);
            console.log('🔄 Refetching with updated filters:', updatedApiFilters);
            dispatch(fetchAllPublicProperties({page: 1, limit: ITEMS_PER_PAGE, ...updatedApiFilters}));
        }, 0);
    };

    // Filter handlers (keeping your existing ones)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => updateFilterAndRefetch(setSearchTerm(e.target.value));
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilterAndRefetch(setCategory(e.target.value === 'all' ? null : e.target.value));
    const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilterAndRefetch(setNeighborhood(e.target.value === 'any' ? null : e.target.value));
    const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilterAndRefetch(setRoomType(e.target.value === 'all' ? null : e.target.value));
    const handleBedroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilterAndRefetch(setBedrooms(e.target.value));
    const handleBathroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilterAndRefetch(setBathrooms(e.target.value));
    const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => updateFilterAndRefetch(toggleAmenity(e.target.value));
    const handlePriceRangeSliderChange = (values: number[]) => updateFilterAndRefetch(setPriceRangeValues([values[0], values[1]]));
    const handleRentRangeDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilterAndRefetch(setRentRange(e.target.value === 'any' ? null : e.target.value));
    const handleSqftMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
        if (value === null || !isNaN(value)) updateFilterAndRefetch(setSqftMin(value));
    };
    const handleSqftMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
        if (value === null || !isNaN(value)) updateFilterAndRefetch(setSqftMax(value));
    };

    // Reset handler - Fixed to use the correct action name
    const handleResetFilter = () => {
        console.log('🧹 Resetting filters');
        dispatch(resetFilters()); // Use the correct action name
        setTimeout(() => {
            const defaultFilters = selectApiFormattedFilters(store.getState());
            dispatch(fetchAllPublicProperties({page: 1, limit: ITEMS_PER_PAGE, ...defaultFilters}));
        }, 0);
    };

    // Trigger fetch
    const triggerFetchWithCurrentFilters = () => {
        const currentApiFilters = selectApiFormattedFilters(store.getState());
        console.log('🔄 Triggering fetch with current filters:', currentApiFilters);
        dispatch(fetchAllPublicProperties({page: 1, limit: ITEMS_PER_PAGE, ...currentApiFilters}));
    };

    // Sort handler
    const handleSortChange = (value: string) => {
        console.log('Sort changed to:', value);
        dispatch(setSortBy(value));
    };

    // Calculate pagination
    const pageCount = pagination?.totalPages || 0;
    const forcePage = pagination ? pagination.currentPage - 1 : -1;
    const currentItemsPerPage = pagination?.itemsPerPage || ITEMS_PER_PAGE;
    const currentOffset = pagination ? (pagination.currentPage - 1) * currentItemsPerPage : 0;

    // Get property stats
    const propertyStats = getPropertyStats(sortedProperties);

    return (
        <div className="property-listing-eight pt-150 xl-pt-120">
            {/* Search/Filter Component */}
            <div className="search-wrapper-three layout-two position-relative">
                <div className="bg-wrapper rounded-0 border-0">
                    <DropdownSeven
                        currentFilters={filters}
                        maxPrice={maxPriceForSlider}
                        priceValue={currentPriceRangeValues}
                        selectedAmenities={currentAmenities}
                        handleCategoryChange={handleCategoryChange}
                        handleLocationChange={handleNeighborhoodChange}
                        handleRentRangeChange={handleRentRangeDropdownChange}
                        handleBedroomChange={handleBedroomChange}
                        handleBathroomChange={handleBathroomChange}
                        handleRoomTypeChange={handleRoomTypeChange}
                        handleSearchChange={handleSearchChange}
                        handlePriceChange={handlePriceRangeSliderChange}
                        handleAmenityChange={handleAmenityChange}
                        handleSqftMinChange={handleSqftMinChange}
                        handleSqftMaxChange={handleSqftMaxChange}
                        handleResetFilter={handleResetFilter}
                        triggerFetch={triggerFetchWithCurrentFilters}
                    />
                </div>
            </div>

            {/* Rest of your component remains the same... */}
            {/* Listing Area */}
            <div className="row gx-0">
                {/* Interactive Map Area */}
                <div className="col-xxl-6 col-lg-5">
                    <div id="google-map-area" className="h-100 position-relative">
                        <PropertyMap
                            properties={sortedProperties}
                            selectedPropertyId={selectedPropertyId || hoveredPropertyId}
                            onPropertySelect={handlePropertySelect}
                            mapHeight="100%"
                            className="h-full"
                        />

                        {/* Map Controls Overlay */}
                        {sortedProperties.length > 0 && (
                            <div className="absolute top-4 left-4 z-10">
                                <div
                                    className="bg-white rounded-xl p-3 shadow-md border border-gray-200 backdrop-blur-sm bg-opacity-95">
                                    <div className="text-sm text-gray-700 font-medium mb-2">
                                        {sortedProperties.length} {sortedProperties.length === 1 ? 'Property' : 'Properties'}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span
                                                className="text-gray-600">Under $2K ({propertyStats.affordable})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                            <span className="text-gray-600">$2K-$3K ({propertyStats.midRange})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-gray-600">$3K+ ({propertyStats.expensive})</span>
                                        </div>
                                    </div>
                                    {propertyStats.averagePrice > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Avg: ${propertyStats.averagePrice.toLocaleString()}/month
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Property List Area */}
                <div className="col-xxl-6 col-lg-7">
                    <div className="bg-light pl-40 pr-40 pt-35 pb-60">
                        {/* Header and Sorting */}
                        <div
                            className="listing-header-filter d-sm-flex justify-content-between align-items-center mb-40 lg-mb-30">
                            <div className="results-count">
                                Showing <span className="color-dark fw-500">
                                    {pagination?.totalItems === 0 ? 0 : currentOffset + 1}–{Math.min(currentOffset + currentItemsPerPage, pagination?.totalItems || 0)}
                                </span> of <span
                                className="color-dark fw-500">{pagination?.totalItems || 0}</span> results
                            </div>
                            <div className="d-flex align-items-center xs-mt-20">
                                <div className="short-filter d-flex align-items-center">
                                    <div className="fs-16 me-2">Sort by:</div>
                                    <NiceSelect
                                        className="nice-select"
                                        options={[
                                            {value: "newest", text: "Newest"},
                                            {value: "price_low", text: "Price Low"},
                                            {value: "price_high", text: "Price High"},
                                        ]}
                                        value={sortBy}  // Use current sortBy value instead of key/defaultCurrent
                                        onChange={handleSortChange}
                                        name="sortBy"
                                        placeholder="Default"
                                    />

                                </div>
                            </div>
                        </div>

                        {/* Loading / Error / No Results States */}
                        {isLoading && (
                            <div className="loading-spinner text-center my-5">
                                <div className="d-flex align-items-center justify-content-center">
                                    <div className="spinner-border text-primary me-2" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <span>Loading properties...</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <div>
                                    <strong>Error:</strong> {error}
                                    <button
                                        onClick={triggerFetchWithCurrentFilters}
                                        className="btn btn-sm btn-outline-danger ms-2"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLoading && !error && sortedProperties.length === 0 && (
                            <div className="text-center my-5">
                                <h3 className="h5 text-gray-600 mb-2">No properties found</h3>
                                <p className="text-gray-500 mb-3">Try adjusting your search criteria to see more
                                    results.</p>
                                <button
                                    onClick={handleResetFilter}
                                    className="btn btn-outline-primary"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {/* Render Sorted Property Cards */}
                        {!isLoading && !error && sortedProperties.length > 0 && (
                            <>
                                <div className="row">
                                    {sortedProperties.map((item: Property) => {
                                        const isFavorited = favoriteIds.includes(item._id);

                                        return (
                                            <div
                                                key={item._id}
                                                id={`property-card-${item._id}`}
                                                className="col-md-6 d-flex mb-40 transition-all duration-300"
                                                onMouseEnter={() => handlePropertyHover(item._id, true)}
                                                onMouseLeave={() => handlePropertyHover(item._id, false)}
                                            >
                                                <div
                                                    className={`listing-card-one style-three border-30 w-100 h-100 transition-all duration-300 cursor-pointer ${
                                                        selectedPropertyId === item._id
                                                            ? 'border-primary shadow-lg transform -translate-y-1 ring-2 ring-blue-200'
                                                            : hoveredPropertyId === item._id
                                                                ? 'shadow-md transform -translate-y-0.5'
                                                                : 'hover:shadow-sm'
                                                    }`}
                                                    onClick={() => handlePropertySelect(item)}
                                                >
                                                    <div className="img-gallery p-15">
                                                        <div className="position-relative border-20 overflow-hidden">
                                                            <div
                                                                className="tag bg-white text-dark fw-500 border-20 position-absolute top-3 left-3 z-10">
                                                                {item.overview.category}
                                                            </div>
                                                            <PropertyCarousel item={item}/>
                                                            <Link
                                                                to={`/listing_details_01/${item._id}`}
                                                                className="btn-four inverse rounded-circle position-absolute top-3 right-3"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <i className="bi bi-arrow-up-right"></i>
                                                            </Link>

                                                            {/* Property Details Badge */}
                                                            <div className="position-absolute bottom-3 left-3">
                                                                <div
                                                                    className="bg-dark bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                                                    {item.listingDetails.bedrooms} bed
                                                                    • {item.listingDetails.bathrooms} bath
                                                                    • {item.listingDetails.size} sqft
                                                                </div>
                                                            </div>

                                                            {/* Selected indicator */}
                                                            {selectedPropertyId === item._id && (
                                                                <div
                                                                    className="position-absolute top-3 left-1/2 transform -translate-x-1/2">
                                                                    <div
                                                                        className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                                                                        <i className="fa-light fa-location-dot me-1"></i>
                                                                        Selected
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="property-info pe-4 ps-4">
                                                        <Link
                                                            to={`/listing_details_01/${item._id}`}
                                                            className="title tran3s text-decoration-none"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {`${item.listingDetails.bedrooms} Bed ${item.overview.category}`}
                                                        </Link>
                                                        <div className="address text-muted mb-2">
                                                            <i className="fa-light fa-location-dot me-1"></i>
                                                            {item.addressAndLocation.address}
                                                        </div>

                                                        {/* Amenities Preview */}
                                                        {item.amenities && item.amenities.length > 0 && (
                                                            <div className="mb-2">
                                                                <div className="text-sm text-muted">
                                                                    <i className="fa-light fa-check-circle me-1"></i>
                                                                    {item.amenities.slice(0, 3).join(', ')}
                                                                    {item.amenities.length > 3 && (
                                                                        <span
                                                                            className="text-primary"> +{item.amenities.length - 3} more</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="pl-footer m0 d-flex align-items-center justify-content-between">
                                                            <strong className="price fw-500 color-dark fs-5">
                                                                ${item.overview.rent.toLocaleString()}
                                                                <span
                                                                    className="fs-6 fw-normal text-muted">/month</span>
                                                            </strong>
                                                            <ul className="style-none d-flex action-icons">
                                                                <li>
                                                                    <button
                                                                        className="action-btn bg-transparent border-0 text-muted hover:text-primary p-2 rounded transition-all duration-200"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handlePropertySelect(item);
                                                                        }}
                                                                        title="View on map"
                                                                    >
                                                                        <i className="fa-light fa-location-dot"></i>
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className={`action-btn bg-transparent border-0 p-2 rounded transition-all duration-200 ${
                                                                            isFavorited
                                                                                ? 'text-danger'
                                                                                : 'text-muted hover:text-danger'
                                                                        }`}
                                                                        onClick={(e) => handleFavoriteToggle(item._id, e)}
                                                                        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                                                                        disabled={favoritesLoading}
                                                                    >
                                                                        <i className={`fa-${isFavorited ? 'solid' : 'light'} fa-heart`}></i>
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {pageCount > 1 && (
                                    <div className="pt-5">
                                        <ReactPaginate
                                            breakLabel="..."
                                            nextLabel={<i className="fa-regular fa-chevron-right"></i>}
                                            onPageChange={handlePageClick}
                                            pageRangeDisplayed={3}
                                            pageCount={pageCount}
                                            previousLabel={<i className="fa-regular fa-chevron-left"></i>}
                                            renderOnZeroPageCount={null}
                                            className="pagination-two d-inline-flex align-items-center justify-content-center style-none"
                                            activeClassName="active"
                                            forcePage={forcePage < 0 ? undefined : forcePage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingFourteenArea;