import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Home, GraduationCap, BookOpen } from 'lucide-react';
import { Profile } from '../../../redux/slices/profileSlice';
import { Property } from '../../../redux/slices/propertySlice';

interface PublicProfileDisplayProps {
    profile: Profile;
    listings: Property[];
    isLoadingListings: boolean;
    listingsError: string | null;
}

const PublicProfileDisplay: React.FC<PublicProfileDisplayProps> = ({
    profile,
    listings,
    isLoadingListings,
    listingsError
}) => {

    console.log("[PublicProfileDisplay] 5. Display component received props:", {
        profile: profile ? JSON.stringify(profile, null, 2) : "null",
        listingsCount: listings.length,
        isLoadingListings
    });
    if (profile) {
        console.log(`[PublicProfileDisplay] 5a. Checking 'createdAt' in props: ${profile.createdAt}`);
    }

    const renderListings = () => {
        if (isLoadingListings) {
            return (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading listings...</span>
                    </div>
                </div>
            );
        }
        if (listingsError) {
            return <div className="alert alert-warning">{listingsError}</div>;
        }
        if (listings.length === 0) {
            return (
                <div className="bg-white card-box p-5 text-center tw-shadow-sm empty-listings-card">
                    <Home size={48} className="text-muted mb-3 mx-auto" />
                    <h5 className="text-muted">{profile.username.split(' ')[0]} has no active listings right now.</h5>
                </div>
            );
        }
        return (
            <div className="row">
                {listings.map((listing) => {
                    // *** THIS IS THE FIX: Safely access the image URL ***
                    const imageUrl = (listing.images && listing.images.length > 0)
                        ? listing.images[0]
                        : '/assets/images/listing/img_placeholder.jpg';

                    return (
                        <div key={listing._id} className="col-md-6 mb-4">
                            <div className="listing-card-one style-three border-30 h-100 tw-shadow-sm hover:tw-shadow-lg tw-transition-shadow">
                                <div className="img-gallery p-15">
                                    <div className="position-relative border-20 overflow-hidden">
                                        <img src={imageUrl} className="w-100" alt={listing.overview.title} style={{ height: '220px', objectFit: 'cover' }} />
                                        <Link to={`/listing_details_01/${listing._id}`} className="btn-four inverse rounded-circle position-absolute">
                                            <i className="bi bi-arrow-up-right"></i>
                                        </Link>
                                    </div>
                                </div>
                                <div className="property-info p-3">
                                    <Link to={`/listing_details_01/${listing._id}`} className="title tran3s">{listing.overview.title}</Link>
                                    <div className="address m0 pb-5">{listing.addressAndLocation.address}</div>
                                    <div className="pl-footer m0 d-flex align-items-center justify-content-between">
                                        <strong className="price fw-500 color-dark">${listing.overview.rent.toLocaleString()}/mo</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container">
            {/* --- PROFILE HERO CARD --- */}
            <div className="bg-white card-box p-4 p-lg-5 tw-shadow-md profile-hero-card">
                <div className="row align-items-center">
                    <div className="col-lg-4 text-center">
                        <img
                            src={profile.image || '/assets/images/dashboard/no-profile-pic.png'}
                            alt={`${profile.username}'s Avatar`}
                            className="lazy-img m-auto profile-avatar"
                        />
                    </div>
                    <div className="col-lg-8">
                        <div className="ps-lg-4 mt-4 mt-lg-0 text-center text-lg-start profile-info-wrapper">
                            <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-3">
                                <h2 className="m-0 profile-username">{profile.username}</h2>
                                <div className="ms-3 verified-badge">
                                    <BadgeCheck size={20} />
                                    <span className="ms-1">Verified Student</span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="profile-meta-item">
                                    <GraduationCap size={20} />
                                    {profile.school_attending || 'School not specified'}
                                </p>
                                <p className="profile-meta-item">
                                    <BookOpen size={20} />
                                    {profile.majors_minors || 'Major not specified'}
                                </p>
                            </div>
                            <div className="profile-about">
                                <h5>About {profile.username.split(' ')[0]}</h5>
                                <p>{profile.about || 'No bio provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PROFILE STATS BAR (BUG FIX APPLIED HERE) --- */}
            <div className="bg-white card-box p-3 mt-4 tw-shadow-sm profile-stats-bar">
                <div className="row text-center">
                    <div className="col-md-4 stat-item">
                        <h5 className="stat-value">{isLoadingListings ? '...' : listings.length}</h5>
                        <p className="stat-label mb-0">Active Listings</p>
                    </div>
                    <div className="col-md-4 stat-item">
                        {/* This check is the crucial fix. It ensures we have the data before trying to format it. */}
                        <h5 className="stat-value">
                            {profile.createdAt
                                ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                : 'N/A'
                            }
                        </h5>
                        <p className="stat-label mb-0">Member Since</p>
                    </div>
                    <div className="col-md-4 stat-item">
                        <h5 className="stat-value text-gray-400">Coming Soon</h5>
                        <p className="stat-label mb-0">Response Rate</p>
                    </div>
                </div>
            </div>

            {/* --- REFINED ACTIVE LISTINGS SECTION --- */}
            <div className="listings-section">
                <h3 className="listings-header">{`Active Listings by ${profile.username.split(' ')[0]}`}</h3>
                {renderListings()}
            </div>
        </div>
    );
};

export default PublicProfileDisplay;