import React from 'react';
import { useChannelStateContext } from 'stream-chat-react';

const CustomEmptyStateIndicator = () => {
    try {
        const { channel } = useChannelStateContext();
        const propertyTitle = channel?.data?.propertyTitle as string || "this property";

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
    } catch (error) {
        // If no channel is selected, show the "no chats yet" message
        return (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 p-5" style={{ minHeight: '400px' }}>
                <div className="mb-4">
                    <i className="fa-regular fa-comments" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                </div>
                <h4 className="mb-2">No chats yet</h4>
                <p className="text-muted text-center">
                    When you approve a request, a chat will be created here.
                </p>
            </div>
        );
    }
};

export default CustomEmptyStateIndicator;