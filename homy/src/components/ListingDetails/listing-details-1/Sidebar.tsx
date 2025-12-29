import React from 'react';
import { useSelector } from 'react-redux';
import { Property } from '../../../redux/slices/propertySlice';
import { selectCurrentUser } from '../../../redux/slices/authSlice';
import { selectProfile } from '../../../redux/slices/profileSlice';
import useListerProfile from '../../../hooks/useListerProfile';
import SidebarInfo from "../listing-details-sidebar/SidebarInfo";

// --- Define Props ---
interface SidebarProps {
    property: Property | null;
    onInterestedClick: () => void;
    interestStatus: string | null;
    isStatusLoading: boolean;
}

const formatUserToProfile = (user: any, profile: any) => {
    if (!user) return null;
    return {
        _id: profile?._id || user._id,
        userId: user._id,
        username: profile?.username || user.name,
        school_email: profile?.school_email || user.email,
        majors_minors: profile?.majors_minors,
        school_attending: profile?.school_attending,
        expected_graduation_year: profile?.expected_graduation_year,
        about: profile?.about,
        image: profile?.image,
    };
};

const Sidebar: React.FC<SidebarProps> = ({ property, onInterestedClick, interestStatus, isStatusLoading }) => {
    const listerUserId = property?.userId;
    const loggedInUser = useSelector(selectCurrentUser);
    const loggedInUserProfile = useSelector(selectProfile);
    const isOwner = loggedInUser && listerUserId === loggedInUser._id;
    const { profile: listerProfile, isLoading: isFetchingLister, error: fetchError } = useListerProfile(
        isOwner ? null : listerUserId
    );

    const profileToDisplay = isOwner ? formatUserToProfile(loggedInUser, loggedInUserProfile) : listerProfile;
    const isLoadingDisplay = isOwner ? false : isFetchingLister;

    return (
        <div className="col-xl-4 col-lg-8 me-auto ms-auto">
            <div className="theme-sidebar-one dot-bg p-30 lg-mt-80 tw-top-5 tw-z-10">
                <SidebarInfo
                    profile={profileToDisplay}
                    isLoading={isLoadingDisplay}
                    onInterestedClick={onInterestedClick}
                    interestStatus={interestStatus}
                    isStatusLoading={isStatusLoading}
                    isOwner={isOwner}
                    propertyId={property?._id}
                    propertyTitle={property?.overview?.title}
                />
                {fetchError && <div className="alert alert-warning small">{fetchError}</div>}
            </div>
        </div>
    );
};

export default Sidebar;