import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useChannelStateContext, useChatContext } from 'stream-chat-react';
import { AppDispatch } from '../../../redux/slices/store';
import { fetchPropertyById, selectCurrentProperty } from '../../../redux/slices/propertySlice';
import { selectCurrentUser } from '../../../redux/slices/authSlice';
import { createDraft } from '../../../redux/slices/contractSlice'; // Added createDraft import
import useListerProfile from '../../../hooks/useListerProfile';

interface CustomChannelHeaderProps {
    toggleSidebar: () => void;
}

const CustomChannelHeader: React.FC<CustomChannelHeaderProps> = ({ toggleSidebar }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate(); // Hook for redirection
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();

    // Selectors
    const currentUser = useSelector(selectCurrentUser); // Get logged in user
    const property = useSelector(selectCurrentProperty);

    // Data extraction
    const propertyId = (channel.data?.propertyId as string) || null;
    const listerId = (channel.data?.listerId as string) || null;

    useEffect(() => {
        if (propertyId && property?._id !== propertyId) {
            dispatch(fetchPropertyById(propertyId));
        }
    }, [propertyId, property, dispatch]);

    // Member logic
    const members = Object.values(channel.state.members).filter(
        ({ user }) => user?.id !== client.userID
    );
    const otherUserFromStream = members.length > 0 ? members[0].user : null;

    const { profile: otherUserProfile, isLoading: isProfileLoading } = useListerProfile(otherUserFromStream?.id);

    // Determine display info
    const displayName = otherUserProfile?.username || otherUserFromStream?.name || 'User';
    const displayImage = otherUserProfile?.image || otherUserFromStream?.image || '/assets/images/dashboard/no-profile-pic.png';

    // --- CONTRACT LOGIC START ---
    // Check if current user is the Lister (Landlord)
    const isLister = currentUser?._id === listerId;
    const tenantId = otherUserFromStream?.id;

    const handleCreateDraft = async () => {
        if (!propertyId || !tenantId) {
            alert("Missing property or tenant information.");
            return;
        }
        try {
            const result = await dispatch(createDraft({ propertyId, tenantId })).unwrap();
            navigate(`/dashboard/agreements/${result._id}/edit`);
        } catch (err) {
            console.error("Failed to create draft", err);
        }
    };
    // --- CONTRACT LOGIC END ---

    return (
        <div className="burrow-chat-header-container">
            <div className="str-chat__header-livestream burrow-chat-header">
                <div className="burrow-chat-header__left">
                    <button onClick={toggleSidebar} className="burrow-chat-header__sidebar-toggle">
                        <i className="fa-solid fa-bars"></i>
                    </button>

                    {isProfileLoading ? (
                        <div className="str-chat__avatar str-chat__avatar--rounded placeholder" style={{ width: '40px', height: '40px' }}></div>
                    ) : (
                        <div className="str-chat__avatar str-chat__avatar--rounded">
                            <img src={displayImage} alt={displayName} className="str-chat__avatar-image" />
                        </div>
                    )}

                    <div className="burrow-chat-header__details">
                        <p className="str-chat__header-livestream-left--title">
                            <Link to={`/profile/${otherUserFromStream?.id}`} className="burrow-user-link">
                                {displayName}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {property && (
                <div className="burrow-property-banner">
                    <img src={property.images?.[0] || '/assets/images/listing/img_placeholder.jpg'} alt={property.overview.title} className="burrow-property-banner__img" />
                    <div className="burrow-property-banner__info">
                        <p className="burrow-property-banner__title">{property.overview.title}</p>
                        <p className="burrow-property-banner__price">${property.overview.rent.toLocaleString()}/month</p>
                    </div>

                    {/* Action Buttons Wrapper */}
                    <div className="d-flex gap-2">
                        <Link to={`/listing_details/${property._id}`} className="burrow-property-banner__btn">
                            View Listing
                        </Link>

                        {/* NEW BUTTON: Only shows for Lister */}
                        {isLister && (
                            <button
                                onClick={handleCreateDraft}
                                className="burrow-property-banner__btn"
                                style={{ backgroundColor: '#2c3e50', borderColor: '#2c3e50' }} // Darker color to distinguish
                                title="Start a sublease agreement"
                            >
                                Draft Contract
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomChannelHeader;