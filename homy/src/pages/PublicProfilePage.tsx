import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/slices/store';
import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import Footer from '../layouts/footers/Footer';
import PublicProfileDisplay from '../components/inner-pages/public-profile/PublicProfileDisplay';
import {
    fetchPublicProfile,
    selectPublicProfile,
    selectIsPublicProfileLoading,
    selectPublicProfileError
} from '../redux/slices/profileSlice';
import {
    fetchPropertiesByUserId,
    selectUserPublicProperties,
    selectIsUserPublicPropertiesLoading,
    selectUserPublicPropertiesError
} from '../redux/slices/propertySlice';

const PublicProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    // Fetch and select profile data
    const profile = useSelector(selectPublicProfile);
    const isLoadingProfile = useSelector(selectIsPublicProfileLoading);
    const profileError = useSelector(selectPublicProfileError);

    // Fetch and select the user's listings data
    const listings = useSelector(selectUserPublicProperties);
    const isLoadingListings = useSelector(selectIsUserPublicPropertiesLoading);
    const listingsError = useSelector(selectUserPublicPropertiesError);

    console.log("[PublicProfilePage] 4. Component re-rendered. Data from Redux store:", {
        profile: profile ? JSON.stringify(profile, null, 2) : "null",
        isLoadingProfile,
        listingsCount: listings.length,
        isLoadingListings
    });
    if (profile) {
        console.log(`[PublicProfilePage] 4a. Checking 'createdAt' in Redux state: ${profile.createdAt}`);
    }

    // Fetch profile and listings when userId changes
    useEffect(() => {
        if (userId) {
            dispatch(fetchPublicProfile(userId));
            dispatch(fetchPropertiesByUserId(userId));
        }
    }, [userId, dispatch]);

    const renderContent = () => {
        if (isLoadingProfile) {
            return <div className="container text-center py-5">Loading profile...</div>;
        }
        if (profileError) {
            return <div className="container text-center py-5 alert alert-danger">Error: {profileError}</div>;
        }
        if (!profile) {
            return <div className="container text-center py-5">User profile not found.</div>;
        }
        // Pass all required data as props to the display component
        return (
            <PublicProfileDisplay
                profile={profile}
                listings={listings}
                isLoadingListings={isLoadingListings}
                listingsError={listingsError}
            />
        );
    };

    return (
        <Wrapper>
            <SEO pageTitle={profile?.username || 'User Profile'} />
            <HeaderOne style={true} />
            <div className="public-profile-page-container">
                <div className="content-wrapper pt-60 xl-pt-90">
                    {renderContent()}
                </div>
            </div>
            <Footer />
        </Wrapper>
    );
};

export default PublicProfilePage;