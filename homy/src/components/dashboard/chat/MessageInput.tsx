import React, { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    disabled = false,
    placeholder = "Type your message..."
}) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSendMessage = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = '40px';
            }
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = '40px';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    return (
        <div className="bg-white border-top p-3">
            <div className="d-flex gap-2 align-items-center">
                {/* Text Input */}
                <div className="flex-grow-1">
                    <textarea
                        ref={textareaRef}
                        className="form-control border-0 resize-none"
                        placeholder={placeholder}
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={disabled}
                        rows={1}
                        style={{
                            maxHeight: '100px',
                            minHeight: '44px',
                            overflow: 'hidden',
                            boxShadow: 'none',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '22px',
                            padding: '12px 16px'
                        }}
                    />
                </div>

                {/* Send Button */}
                <button
                    className="btn rounded-circle d-flex align-items-center justify-content-center"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || disabled}
                    style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: message.trim() && !disabled ? '#f46248' : '#e9ecef',
                        border: 'none',
                        color: 'white'
                    }}
                    title="Send message"
                >
                    {disabled ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Sending...</span>
                        </div>
                    ) : (
                        <i className="bi bi-send-fill"></i>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MessageInput;