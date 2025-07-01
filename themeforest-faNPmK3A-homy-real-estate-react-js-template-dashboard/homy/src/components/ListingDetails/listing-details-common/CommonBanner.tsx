import React from 'react';
import { Link } from "react-router-dom";
import { Property } from '../../../redux/slices/propertySlice';

interface CommonBannerProps {
    property: Property | null;
    style_3?: boolean;
}

const CommonBanner: React.FC<CommonBannerProps> = ({ property, style_3 }) => {

    if (!property) {
        // Render placeholders if property data isn't ready
        return (
            <div className="row placeholder-glow">
                <div className="col-lg-6"><h3 className="placeholder col-10"></h3><p className="placeholder col-8"></p></div>
                <div className="col-lg-6 text-lg-end"><p className="placeholder col-4"></p><p className="placeholder col-6"></p></div>
            </div>
        );
    }

    // Get the address string safely.
    const fullAddress = property.addressAndLocation?.address || '';

    // Create the encoded Google Maps URL.
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    // Derive display values
    const displayTitle = property.title || `${property.listingDetails.bedrooms} Bed ${property.overview.category} in ${property.overview.neighborhood}`;
    const displayTag = property.tag || (property.overview.category === 'Apartment' ? 'FOR SELL' : 'FOR RENT');
    const estimatedPayment = (property.overview.rent / 20).toFixed(0);

    return (
        <div className="row">
            <div className="col-lg-6">
                <h3 className="property-titlee">{displayTitle}</h3>
                <div className="d-flex flex-wrap mt-10">
                    <div className={`list-type text-uppercase mt-15 me-3 ${style_3 ? "bg-white text-dark fw-500" : "text-uppercase border-20"}`}>
                        {displayTag}
                    </div>
                    {fullAddress && (
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="address-link" title={`View "${fullAddress}" on Google Maps`}>
                            <div className="address mt-15">
                                <i className="bi bi-geo-alt"></i> {fullAddress}
                            </div>
                        </a>
                    )}
                </div>
            </div>
            <div className="col-lg-6 text-lg-end">
                <div className="d-inline-block md-mt-40">
                    <div className="price color-dark fw-500">Price: ${property.overview.rent.toLocaleString()} /m</div>
                    <div className="est-price fs-20 mt-25 mb-35 md-mb-30">Est. Payment <span
                        className="fw-500 color-dark">${estimatedPayment}/mo*</span>
                    </div>
                    <ul className="style-none d-flex align-items-center action-btns">
                        <li className="me-auto fw-500 color-dark"><i className="fa-sharp fa-regular fa-share-nodes me-2"></i> Share</li>
                        <li><Link to="#" className={`d-flex align-items-center justify-content-center tran3s ${style_3 ? "" : "rounded-circle"}`}><i className="fa-light fa-heart"></i></Link></li>
                        <li><Link to="#" className={`d-flex align-items-center justify-content-center tran3s ${style_3 ? "" : "rounded-circle"}`}><i className="fa-light fa-bookmark"></i></Link></li>
                        <li><Link to="#" className={`d-flex align-items-center justify-content-center tran3s ${style_3 ? "" : "rounded-circle"}`}><i className="fa-light fa-circle-plus"></i></Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommonBanner;