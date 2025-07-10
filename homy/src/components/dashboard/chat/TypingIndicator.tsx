import React from "react";

interface TypingIndicatorProps {
  userName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName = "User",
}) => {
  return (
    <div className="typing-indicator mb-3 d-flex justify-content-start">
      <div className="message-content">
        <div
          className="message-text p-3 rounded-3 bg-light text-dark"
          style={{ maxWidth: "70%" }}
        >
          <div className="d-flex align-items-center">
            <small className="me-2 text-muted">{userName} is typing</small>
            <div className="typing-dots d-flex align-items-center gap-1">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .typing-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #6c757d;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%,
          80%,
          100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
