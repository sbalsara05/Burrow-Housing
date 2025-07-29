import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useChannelStateContext, useChatContext } from 'stream-chat-react';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchPropertyById, selectCurrentProperty } from '../../../redux/slices/propertySlice';
import { selectCurrentUser } from '../../../redux/slices/authSlice';

interface CustomChannelHeaderProps {
    toggleSidebar: () => void;
}

const CustomChannelHeader: React.FC<CustomChannelHeaderProps> = ({ toggleSidebar }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();

    // Get the logged-in user from Redux to identify the "other" user
    const loggedInUser = useSelector(selectCurrentUser);

    // Get the property details from Redux store
    const property = useSelector(selectCurrentProperty);

    // Extract propertyId from channel's custom data
    const propertyId = (channel.data?.propertyId as string) || null;

    useEffect(() => {
        // Fetch property details if propertyId exists and it's not already loaded
        if (propertyId && property?._id !== propertyId) {
            dispatch(fetchPropertyById(propertyId));
        }
    }, [propertyId, property, dispatch]);

    // Determine the other member in the chat
    const members = Object.values(channel.state.members).filter(
        ({ user }) => user?.id !== client.userID
    );
    const otherUser = members.length > 0 ? members[0].user : null;

    return (
        <div className="burrow-chat-header-container">
            <div className="str-chat__header-livestream burrow-chat-header">
                <div className="burrow-chat-header__left">
                    <button onClick={toggleSidebar} className="burrow-chat-header__sidebar-toggle">
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    {otherUser && (
                        <div className="str-chat__avatar str-chat__avatar--rounded">
                            <img src={otherUser.image || '/assets/images/dashboard/no-profile-pic.png'} alt={otherUser.name} className="str-chat__avatar-image" />
                        </div>
                    )}
                    <div className="burrow-chat-header__details">
                        <p className="str-chat__header-livestream-left--title">
                            {/* We will link this to a public profile page in the future */}
                            <Link to="#" className="burrow-user-link">
                                {otherUser?.name || 'User'}
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
                    <Link to={`/listing_details_01/${property._id}`} className="burrow-property-banner__btn">
                        View Listing
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CustomChannelHeader;