import React from 'react';
import { useChannelStateContext } from 'stream-chat-react';

const CustomEmptyStateIndicator = () => {
    const { channel } = useChannelStateContext();
    const propertyTitle = channel.data?.propertyTitle as string || "this property";

    return (
        <div className="burrow-empty-state">
            <div className="burrow-empty-state__icon">
                <i className="fa-regular fa-comments"></i>
            </div>
            <p className="burrow-empty-state__title">This is the beginning of your conversation.</p>
            <p className="burrow-empty-state__subtitle">
                Start by sending a message about "{propertyTitle}".
            </p>
        </div>
    );
};

export default CustomEmptyStateIndicator;