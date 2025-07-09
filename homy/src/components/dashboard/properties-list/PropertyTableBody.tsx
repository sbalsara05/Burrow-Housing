import React from 'react';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { Property } from '../../../redux/slices/propertySlice';

interface PropertyTableBodyProps {
    properties: Property[];
}

const PropertyTableBody: React.FC<PropertyTableBodyProps> = ({ properties }) => {

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // --- Share Functionality ---
    const handleShare = async (property: Property) => {
        // Construct the full URL for the property details page
        const propertyUrl = `${window.location.origin}/listing_details_01/${property._id}`;

        const shareData = {
            title: property.overview.title || 'Check out this property!',
            text: `I found this property on Burrow Housing: ${property.overview.title || 'View Details'}`,
            url: propertyUrl,
        };

        // Use the Web Share API if available
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log("Property shared successfully!");
            } catch (err) {
                // User cancellation is not an error, so we can ignore it or log it.
                console.log("Share action was cancelled by the user.");
            }
        } else {
            // Fallback for desktop browsers: copy to clipboard
            try {
                await navigator.clipboard.writeText(propertyUrl);
                toast.success("Property link copied to clipboard!");
            } catch (err) {
                toast.error("Failed to copy link.");
                console.error("Failed to copy link: ", err);
            }
        }
    };

    return (
        <tbody className="border-0">
            {properties.map((item) => (
                <tr key={item._id}>
                    <td>
                        <div className="d-lg-flex align-items-center position-relative">
                            <img
                                src={item.images && item.images.length > 0 ? item.images[0] : "/assets/images/listing/img_placeholder.jpg"}
                                alt={item.overview.title || "Property Image"}
                                className="p-img"
                            />
                            <div className="ps-lg-4 md-pt-10">
                                <Link to={`/listing_details_01/${item._id}`} className="property-name tran3s color-dark fw-500 fs-20 stretched-link">
                                    {item.overview.title || `${item.listingDetails.bedrooms} Bed ${item.overview.category}`}
                                </Link>
                                <div className="address">{item.addressAndLocation.address}</div>
                                <strong className="price color-dark">${item.overview.rent.toLocaleString()} /m</strong>
                            </div>
                        </div>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>0</td> {/* Placeholder for view count */}
                    <td>
                        {/* Placeholder for status */}
                        <div className="property-status">Active</div>
                    </td>
                    <td>
                        <div className="action-dots float-end">
                            <button className="action-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span></span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    {/* --- "View" Button Logic (already correct) --- */}
                                    <Link className="dropdown-item" to={`/listing_details_01/${item._id}`}>
                                        <img src="/assets/images/dashboard/icon/icon_18.svg" alt="" className="lazy-img" /> View
                                    </Link>
                                </li>
                                <li>
                                    {/* --- "Share" Button Logic --- */}
                                    <button
                                        className="dropdown-item"
                                        onClick={() => handleShare(item)}
                                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.25rem 1rem' }}
                                    >
                                        <img src="/assets/images/dashboard/icon/icon_19.svg" alt="" className="lazy-img" /> Share
                                    </button>
                                </li>
                                {/* --- Placeholder for Edit and Delete --- */}
                                <li>
                                    <Link className="dropdown-item" to="#">
                                        <img src="/assets/images/dashboard/icon/icon_20.svg" alt="" className="lazy-img" /> Edit
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="#">
                                        <img src="/assets/images/dashboard/icon/icon_21.svg" alt="" className="lazy-img" /> Delete
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
}

export default PropertyTableBody;