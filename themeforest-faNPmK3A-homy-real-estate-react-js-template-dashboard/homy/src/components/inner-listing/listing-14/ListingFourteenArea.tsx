import React, { useEffect, useMemo } from 'react';
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, PayloadAction } from '@reduxjs/toolkit';
import store, { AppDispatch, RootState } from '../../../redux/store';
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
    // Selectors
    selectFilters,
    selectSortBy,
    selectApiFormattedFilters,
    selectMaxPriceForSlider,
    selectPriceRangeValues,
    selectAmenities,
    // Actions
    setSortBy,
    resetFilters as resetFilterAction,
    setCategory,
    setNeighborhood,
    setRoomType,
    setBedrooms,
    setBathrooms,
    toggleAmenity,
    setPriceRangeValues,
    setRentRange,
    setMaxPriceForSlider, // Keep if needed elsewhere, though max price usually comes from fetched data
    setSearchTerm,
    setSqftMin,
    setSqftMax,
} from '../../../redux/slices/filterSlice';

import DropdownSeven from "../../search-dropdown/inner-dropdown/DropdownSeven";
import NiceSelect from "../../../ui/NiceSelect";
import Fancybox from "../../common/Fancybox";

const ITEMS_PER_PAGE = 8;

// --- Client-Side Sorting Logic ---
const selectSortedPublicProperties = createSelector(
    [selectAllPublicProperties, selectSortBy],
    (properties, sortBy) => {
        console.log(`Sorting ${properties.length} properties by: ${sortBy}`);
        const sorted = [...properties]; // Create a mutable copy
        switch (sortBy) {
            case 'price_low':
                sorted.sort((a, b) => a.overview.rent - b.overview.rent);
                break;
            case 'price_high':
                sorted.sort((a, b) => b.overview.rent - a.overview.rent);
                break;
            case 'newest':
            default:
                // Sort by createdAt date string (descending for newest)
                // Ensure createdAt is a valid date string or timestamp
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        return sorted;
    }
);
// --- End Client-Side Sorting Logic ---


const ListingFourteenArea = () => {
    const dispatch = useDispatch<AppDispatch>();

    // --- Select Data from Redux ---
    const properties = useSelector(selectAllPublicProperties);
    const pagination = useSelector(selectPublicPagination);
    const isLoading = useSelector(selectPropertyLoading);
    const error = useSelector(selectPropertyError);
    const filters = useSelector(selectFilters); // Get full filter state object
    const apiFormattedFilters = useSelector(selectApiFormattedFilters); // Get filters formatted for API
    const sortBy = useSelector(selectSortBy);
    const maxPriceForSlider = useSelector(selectMaxPriceForSlider);
    const currentPriceRangeValues = useSelector(selectPriceRangeValues);
    const currentAmenities = useSelector(selectAmenities);
    const propertyStatus = useSelector(selectPropertyStatus);;

    // --- Get SORTED properties using the memoized selector ---
    const sortedProperties = useSelector(selectSortedPublicProperties);

    // --- Effect for Initial Load / Error Clearing ---
    useEffect(() => {
        dispatch(clearPropertyError());
        console.log(`ListingFourteenArea mount/update. Status: ${propertyStatus}, Properties length: ${properties.length}, isLoading: ${isLoading}`);

        // Fetch ONLY if status is 'idle' (or maybe 'failed') AND properties array is empty.
        // This prevents fetching again if the status is already 'loading' or 'succeeded' (even with 0 results).
        if ((propertyStatus === 'idle' || propertyStatus === 'failed') && properties.length === 0 && !isLoading) {
            console.log("Status allows fetch and properties empty/not loading. Dispatching fetch page 1:", apiFormattedFilters);
            dispatch(fetchAllPublicProperties({ page: 1, limit: ITEMS_PER_PAGE, ...apiFormattedFilters }));
        } else {
            console.log("Conditions not met for initial/refresh fetch.");
        }

    }, [dispatch, propertyStatus, properties.length, isLoading, apiFormattedFilters]);

    // useEffect(() => {
    //     // This function will run when the component unmounts
    //     return () => {
    //         console.log("ListingFourteenArea unmounting, resetting filters.");
    //         dispatch(resetFilterAction());
    //     };
    // }, [dispatch]);


    // --- Pagination Handler ---
    const handlePageClick = (event: { selected: number }) => {
        const newPage = event.selected + 1;
        console.log(`Pagination: Requesting page ${newPage} with current filters used for fetch:`, apiFormattedFilters);
        // Pass current filters from selector state
        dispatch(fetchAllPublicProperties({ page: newPage, limit: ITEMS_PER_PAGE, ...apiFormattedFilters }));
        window.scrollTo(0, 0);
    };

    // --- Filter Update and Refetch Logic ---
    const updateFilterAndRefetch = (filterAction: PayloadAction<any>) => {
        console.log("Filter change detected, dispatching update:", filterAction);
        dispatch(filterAction);
        setTimeout(() => {
            const latestState = store.getState(); // Get latest state
            const updatedApiFilters = selectApiFormattedFilters(latestState); // Format filters from latest state
            console.log("Refetching page 1 with updated filters:", updatedApiFilters);
            // Dispatch fetch with EXPLICIT filters
            dispatch(fetchAllPublicProperties({ page: 1, limit: ITEMS_PER_PAGE, ...updatedApiFilters }));
        }, 0);
    };

    // --- Specific Filter Handlers ---
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

    // --- Reset Handler ---
    const handleResetFilter = () => {
        dispatch(resetFilterAction());
        setTimeout(() => { // Ensure state is reset before fetching
            const defaultFilters = selectApiFormattedFilters(store.getState());
            console.log("Refetching page 1 after reset with filters:", defaultFilters);
            dispatch(fetchAllPublicProperties({ page: 1, limit: ITEMS_PER_PAGE, ...defaultFilters }));
        }, 0);
    };

    // --- Trigger Fetch (e.g., from Modal Apply) ---
    const triggerFetchWithCurrentFilters = () => {
        const currentApiFilters = selectApiFormattedFilters(store.getState()); // Get latest state
        console.log("Triggering fetch with current modal filters:", currentApiFilters);
        dispatch(fetchAllPublicProperties({ page: 1, limit: ITEMS_PER_PAGE, ...currentApiFilters }));
    };

    // --- Sort Handler ---
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log("Sort changed to:", event.target.value);
        dispatch(setSortBy(event.target.value));
        // Client-side sorting re-runs automatically due to selector dependency
    };

    // --- Calculate Pagination ---
    const pageCount = pagination?.totalPages || 0;
    const forcePage = pagination ? pagination.currentPage - 1 : -1;
    const currentItemsPerPage = pagination?.itemsPerPage || ITEMS_PER_PAGE;
    const currentOffset = pagination ? (pagination.currentPage - 1) * currentItemsPerPage : 0;

    return (
        <div className="property-listing-eight pt-150 xl-pt-120">
            {/* Search/Filter Component */}
            <div className="search-wrapper-three layout-two position-relative">
                <div className="bg-wrapper rounded-0 border-0">
                    {/* Pass correct state and handlers */}
                    <DropdownSeven
                        currentFilters={filters}
                        maxPrice={maxPriceForSlider} // Use the slider max price
                        priceValue={currentPriceRangeValues} // Pass numerical range for slider
                        selectedAmenities={currentAmenities} // Pass amenities array
                        // Pass handlers
                        handleCategoryChange={handleCategoryChange}
                        handleLocationChange={handleNeighborhoodChange}
                        handleRentRangeChange={handleRentRangeDropdownChange} // For dropdown
                        handleBedroomChange={handleBedroomChange}
                        handleBathroomChange={handleBathroomChange}
                        handleRoomTypeChange={handleRoomTypeChange}
                        // Modal Handlers
                        handleSearchChange={handleSearchChange}
                        handlePriceChange={handlePriceRangeSliderChange} // For slider
                        handleAmenityChange={handleAmenityChange}
                        handleSqftMinChange={handleSqftMinChange}
                        handleSqftMaxChange={handleSqftMaxChange}
                        handleResetFilter={handleResetFilter}
                        triggerFetch={triggerFetchWithCurrentFilters}
                    />
                </div>
            </div>

            {/* Listing Area */}
            <div className="row gx-0">
                {/* Map Area */}
                <div className="col-xxl-6 col-lg-5">
                    <div id="google-map-area" className="h-100">
                        <div className="google-map-home" id="contact-google-map">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83088.3595592641!2d-105.54557276330914!3d39.29302101722867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x874014749b1856b7%3A0xc75483314990a7ff!2sColorado%2C%20USA!5e0!3m2!1sen!2sbd!4v1699764452737!5m2!1sen!2sbd"
                                width="600" height="450" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade" className="w-100 h-100">
                            </iframe>
                        </div>
                    </div>
                </div>

                {/* Property List Area */}
                <div className="col-xxl-6 col-lg-7">
                    <div className="bg-light pl-40 pr-40 pt-35 pb-60">
                        {/* Header and Sorting */}
                        <div className="listing-header-filter d-sm-flex justify-content-between align-items-center mb-40 lg-mb-30">
                            <div>Showing <span className="color-dark fw-500">{pagination?.totalItems === 0 ? 0 : currentOffset + 1}–{Math.min(currentOffset + currentItemsPerPage, pagination?.totalItems || 0)}</span> of <span className="color-dark fw-500">{pagination?.totalItems || 0}</span> results</div>
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
                                        key={`sort-${sortBy}`} // Add key
                                        defaultCurrent={["newest", "price_low", "price_high"].indexOf(sortBy)}
                                        onChange={handleSortChange}
                                        name="sortBy"
                                        placeholder="Default" />
                                </div>
                                <Link to="/listing_15" className="tran3s layout-change rounded-circle ms-auto ms-sm-3" data-bs-toggle="tooltip" title="Switch To List View">
                                    <i className="fa-regular fa-bars"></i>
                                </Link>
                            </div>
                        </div>

                        {/* Loading / Error / No Results States */}
                        {isLoading && <div className="loading-spinner text-center my-5">Loading properties...</div>}
                        {error && <div className="alert alert-danger" role="alert">Error: {error}</div>}
                        {!isLoading && !error && sortedProperties.length === 0 && <div className="text-center my-5">No properties found matching your criteria.</div>}

                        {/* Render Sorted Property Cards */}
                        {!isLoading && !error && sortedProperties.length > 0 && (
                            <>
                                <div className="row">
                                    {/* Use the client-side sortedProperties array */}
                                    {sortedProperties.map((item: Property) => (
                                        <div key={item._id} className="col-md-6 d-flex mb-40">
                                            <div className="listing-card-one style-three border-30 w-100 h-100">
                                                <div className="img-gallery p-15">
                                                    <div className="position-relative border-20 overflow-hidden">
                                                        <div className="tag bg-white text-dark fw-500 border-20">{item.overview.category}</div>
                                                        {/* Placeholder Image - TODO: Replace with actual image logic */}
                                                        <img src="/assets/images/listing/img_13.jpg" className="w-100 border-20" alt={item.description || 'Property image'} />
                                                        <Link to={`/listing_details_01/${item._id}`} className="btn-four inverse rounded-circle position-absolute"><i className="bi bi-arrow-up-right"></i></Link>
                                                        {/* Add Fancybox/Image count later */}
                                                    </div>
                                                </div>
                                                <div className="property-info pe-4 ps-4">
                                                    {/* Example derived title */}
                                                    <Link to={`/listing_details_01/${item._id}`} className="title tran3s">{`${item.listingDetails.bedrooms} Bed ${item.overview.category}`}</Link>
                                                    <div className="address">{item.addressAndLocation.address}</div>
                                                    <div className="pl-footer m0 d-flex align-items-center justify-content-between">
                                                        <strong className="price fw-500 color-dark">${item.overview.rent.toLocaleString()} /m</strong>
                                                        <ul className="style-none d-flex action-icons">
                                                            <li><Link to="#"><i className="fa-light fa-heart"></i></Link></li> {/* Add to favourites logic later */}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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