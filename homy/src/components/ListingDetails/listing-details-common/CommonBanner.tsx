
import React from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../redux/slices/store';
import { Property } from '../../../redux/slices/propertySlice';
import {
    addToFavorites,
    removeFromFavorites,
    selectFavoriteIds,
    selectFavoritesLoading
} from '../../../redux/slices/favoritesSlice';
import { selectIsAuthenticated } from '../../../redux/slices/authSlice';
import { authUtils } from '../../../utils/authUtils';

interface CommonBannerProps {
    property: Property | null;
    style_3?: boolean;
}

const CommonBanner: React.FC<CommonBannerProps> = ({ property, style_3 }) => {
    const dispatch = useDispatch<AppDispatch>();
    const favoriteIds = useSelector(selectFavoriteIds);
    const favoritesLoading = useSelector(selectFavoritesLoading);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (!property) {
        // Render placeholders if property data isn't ready
        return (
            <div className="row placeholder-glow">
                <div className="col-lg-6"><h3 className="placeholder col-10"></h3><p className="placeholder col-8"></p>
                </div>
                <div className="col-lg-6 text-lg-end"><p className="placeholder col-4"></p><p
                    className="placeholder col-6"></p></div>
            </div>
        );
    }

    const isFavorited = favoriteIds.includes(property._id);

    // Handle favorite toggle
    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to add favorites');
            return;
        }

        // Check if token is valid before making the request
        if (!authUtils.isTokenValid()) {
            toast.error('Your session has expired. Please login again.');
            authUtils.redirectToLogin();
            return;
        }

        try {
            if (isFavorited) {
                await dispatch(removeFromFavorites(property._id)).unwrap();
                toast.success('Removed from favorites');
            } else {
                await dispatch(addToFavorites(property._id)).unwrap();
                toast.success('Added to favorites');
            }
        } catch (error: any) {
            console.error('Error updating favorites:', error);

            // Check if it's a token-related error
            if (error === 'Invalid token' || error === 'Not authenticated') {
                toast.error('Your session has expired. Please login again.');
                authUtils.redirectToLogin();
            } else {
                toast.error('Failed to update favorites');
            }
        }
    };

    // --- Logic for Clickable Address ---
    const fullAddress = property.addressAndLocation?.address || '';
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    // Share Handler Logic ---
    const handleShare = async () => {
        const shareData = {
            title: property.title || 'Check out this property!',
            text: `I found this amazing property on Burrow Housing: ${property.title || `${property.listingDetails.bedrooms} Bed ${property.overview.category} in ${property.overview.neighborhood}`}`,
            url: window.location.href, // Gets the current page URL
        };

        // Check if the Web Share API is supported by the browser
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // This error is thrown if the user cancels the share dialog, so we can ignore it.
            }
        } else {
            // Fallback for browsers that do not support the Web Share API (e.g., most desktops)
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast.success("Link copied to clipboard!");
            } catch (err) {
                toast.error("Failed to copy link.");
            }
        }
    };

    // Derive display values
    const displayTitle = property.title || `${property.listingDetails.bedrooms} Bed ${property.overview.category} in ${property.overview.neighborhood}`;
    const displayTag = property.tag || (property.overview.category === 'Apartment' ? 'FOR SUBLEASE' : 'FOR SUBLEASE');
    const estimatedPayment = (property.overview.rent / 20).toFixed(0);
    
    // Debug: Log ambassador status
    if (property.hasBeenViewedByAmbassador !== undefined) {
        console.log('🏠 Property ID:', property._id);
        console.log('✅ Ambassador Verified:', property.hasBeenViewedByAmbassador);
    }

    return (
        <div className="row">
            <div className="col-lg-6">
                <h3 className="property-titlee">{displayTitle}</h3>
                <div className="tw-">
                    <div className="d-flex flex-wrap align-items-center mt-10 tw-gap-3">
                        <div className="tw-rounded-full tw-size-fit tw-bg-primary tw-text-black tw-font-medium">
                            <div
                                className={` text-uppercase mt-15 tw-pl-4 tw-pr-4 tw-pb-2 tw-size-fit ${style_3 ? "bg-white text-dark fw-500" : "text-uppercase border-20"}`}>
                                {displayTag}
                            </div>
                        </div>
                        {property.leaseTakenOver && (
                            <div className="tw-rounded-full tw-size-fit tw-font-medium lease-taken-over-pill">
                                <div className="d-flex align-items-center justify-content-center text-uppercase mt-15 tw-pl-4 tw-pr-4 tw-pb-2 tw-gap-2 tw-size-fit">
                                    <i className="bi bi-check2-circle"></i>
                                    <span className="tw-font-semibold tw-text-sm">Lease taken over</span>
                                </div>
                            </div>
                        )}
                        {property.hasBeenViewedByAmbassador && (
                            <div className="tw-rounded-full tw-size-fit tw-bg-primary tw-text-black tw-font-medium">
                                <div className="d-flex align-items-center justify-content-center text-uppercase mt-15 tw-pl-4 tw-pr-4 tw-pb-2 tw-gap-2">
                                    <i className="bi bi-check-circle-fill text-dark"></i>
                                    <span className="tw-font-semibold text-dark tw-text-sm">Ambassador Verified</span>
                                </div>
                            </div>
                        )}
                        {fullAddress && (
                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="address-link"
                               title={`View "${fullAddress}" on Google Maps`}>
                                <div className="address mt-15 tw-font-[500] tw-text-black">
                                    <i className="bi bi-geo-alt"></i> {fullAddress}
                                </div>
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-lg-6 text-lg-end">
                <div className="d-inline-block md-mt-40">
                    <div className="price color-dark fw-500">Price: ${property.overview.rent.toLocaleString()} /m</div>
                    <div className="est-price fs-20 mt-25 mb-35 md-mb-30">
                    </div>
                    <ul className="style-none d-flex align-items-center justify-content-end action-btns tw-pt-14">
                        <li>
                            <button onClick={handleShare}
                                    className="share-btn d-flex align-items-center fw-500 color-dark me-3">
                                <i className="fa-sharp fa-regular fa-share-nodes me-2"></i>
                                <span>Share</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleFavoriteToggle}
                                disabled={favoritesLoading}
                                className={`d-flex align-items-center justify-content-center tran3s ${
                                    style_3 ? "" : "rounded-circle"
                                } ${
                                    isFavorited 
                                        ?  'text-white' 
                                        : 'bg-white text-dark border'
                                }`}
                                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    cursor: favoritesLoading ? 'not-allowed' : 'pointer',
                                    backgroundColor: isFavorited ? '#ff6b35' : '#ffffff',
                                    border: isFavorited ? 'none' : '1px solid #e0e0e0'
                                }}
                            >
                                <i className="fa-light fa-heart"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommonBanner;