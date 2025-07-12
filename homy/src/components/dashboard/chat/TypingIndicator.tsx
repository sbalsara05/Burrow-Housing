import React from "react";

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName = "User",
  userAvatar = "/images/default-avatar.png"
}) => {
  return (
    <div className="typing-indicator">
      <div className="message-content">
        {/* User Avatar */}
        <div className="message-avatar">
          <img
            src={userAvatar}
            alt={userName}
            className="rounded-circle"
            width="32"
            height="32"
            onError={(e) => {
              e.currentTarget.src = '/images/default-avatar.png';
            }}
          />
        </div>

        <div className="message-wrapper">
          {/* Sender Name */}
          <div className="message-sender">{userName}</div>

          {/* Typing Animation */}
          <div className="message-text">
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted small">typing</span>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;