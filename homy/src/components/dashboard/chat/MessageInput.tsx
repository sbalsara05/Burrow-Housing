import { useState, useRef, KeyboardEvent } from 'react';
import FileUpload from './FileUpload';

interface MessageInputProps {
    onSendMessage: (message: string, type?: 'text' | 'image' | 'file', fileUrl?: string, fileName?: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [showFileUpload, setShowFileUpload] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
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
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleFileUpload = (file: File, type: 'image' | 'file') => {
        // Create a temporary URL for the file (in real app, upload to server first)
        const fileUrl = URL.createObjectURL(file);

        if (type === 'image') {
            onSendMessage('', 'image', fileUrl, file.name);
        } else {
            onSendMessage('', 'file', fileUrl, file.name);
        }

        setShowFileUpload(false);
    };

    return (
        <div className="message-input-container">
            {/* File Upload Modal */}
            {showFileUpload && (
                <div className="file-upload-overlay position-absolute bottom-100 start-0 end-0 bg-white border-top p-3">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        onClose={() => setShowFileUpload(false)}
                    />
                </div>
            )}

            {/* Message Input */}
            <div className="message-input d-flex align-items-end p-3 gap-2">
                {/* Attachment Button */}
                <button
                    className="btn btn-link p-2"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    title="Attach file"
                >
                    <i className="bi bi-paperclip fs-5 text-muted"></i>
                </button>

                {/* Text Input */}
                <div className="flex-grow-1">
                    <textarea
                        ref={textareaRef}
                        className="form-control border-0 resize-none"
                        placeholder="Type your message..."
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        rows={1}
                        style={{
                            maxHeight: '100px',
                            minHeight: '40px',
                            overflow: 'hidden'
                        }}
                    />
                </div>

                {/* Emoji Button */}
                <button
                    className="btn btn-link p-2"
                    title="Add emoji"
                >
                    <i className="bi bi-emoji-smile fs-5 text-muted"></i>
                </button>

                {/* Send Button */}
                <button
                    className={`btn btn-primary rounded-circle d-flex align-items-center justify-content-center ${message.trim() ? '' : 'disabled'
                        }`}
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    style={{ width: '40px', height: '40px' }}
                >
                    <i className="bi bi-send-fill"></i>
                </button>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions d-flex justify-content-center gap-2 pb-2">
                <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-camera me-1"></i>
                    Camera
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-image me-1"></i>
                    Gallery
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-geo-alt me-1"></i>
                    Location
                </button>
            </div>
        </div>
    );
};

export default MessageInput;