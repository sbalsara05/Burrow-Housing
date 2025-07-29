import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useChannelStateContext, useChatContext } from 'stream-chat-react';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchPropertyById, selectCurrentProperty } from '../../../redux/slices/propertySlice';
import { selectCurrentUser } from '../../../redux/slices/authSlice';

const CustomChannelHeader: React.FC = () => {
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
        <div className="str-chat__header-livestream burrow-chat-header">
            <div className="burrow-chat-header__left">
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
                    {property && (
                        <p className="str-chat__header-livestream-left--subtitle">
                            Inquiry for: <Link to={`/listing_details_01/${property._id}`} className="burrow-property-link">{property.overview.title}</Link>
                        </p>
                    )}
                </div>
            </div>
            {/* You can add actions (e.g., a "View Property" button) on the right side if needed */}
        </div>
    );
};

export default CustomChannelHeader;