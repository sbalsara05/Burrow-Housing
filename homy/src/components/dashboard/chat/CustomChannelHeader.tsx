import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useChannelStateContext, useChatContext } from 'stream-chat-react';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchPropertyById, selectCurrentProperty } from '../../../redux/slices/propertySlice';
import { selectCurrentUser } from '../../../redux/slices/authSlice';
import useListerProfile from '../../../hooks/useListerProfile';

interface CustomChannelHeaderProps {
    toggleSidebar: () => void;
}

const CustomChannelHeader: React.FC<CustomChannelHeaderProps> = ({ toggleSidebar }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();

    const property = useSelector(selectCurrentProperty);
    const propertyId = (channel.data?.propertyId as string) || null;

    useEffect(() => {
        if (propertyId && property?._id !== propertyId) {
            dispatch(fetchPropertyById(propertyId));
        }
    }, [propertyId, property, dispatch]);

    const members = Object.values(channel.state.members).filter(
        ({ user }) => user?.id !== client.userID
    );
    const otherUserFromStream = members.length > 0 ? members[0].user : null;

    const { profile: otherUserProfile, isLoading: isProfileLoading } = useListerProfile(otherUserFromStream?.id);

    // Determine the most up-to-date information to display
    const displayName = otherUserProfile?.username || otherUserFromStream?.name || 'User';
    const displayImage = otherUserProfile?.image || otherUserFromStream?.image || '/assets/images/dashboard/no-profile-pic.png';

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
                    <Link to={`/listing_details/${property._id}`} className="burrow-property-banner__btn">
                        View Listing
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CustomChannelHeader;