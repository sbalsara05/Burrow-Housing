// frontend/components/ListingDetails/listing-details-common/CommonPropertyVideoTour.tsx
import React, { useState } from "react"; // Import React and useState
import VideoPopup from "../../../modals/VideoPopup"; // Adjust path if needed

// Define props interface
interface CommonPropertyVideoTourProps {
    videoUrl?: string | null; // Optional video URL (e.g., YouTube link)
    thumbnailUrl?: string | null; // Optional thumbnail URL
}

// Helper function to extract YouTube video ID
const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};


const CommonPropertyVideoTour: React.FC<CommonPropertyVideoTourProps> = ({
    videoUrl,
    thumbnailUrl // Use a default thumbnail if not provided
}) => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    // Don't render anything if no video URL is provided
    if (!videoUrl) {
        return null;
    }

    // Extract YouTube ID for the ModalVideo component
    const videoId = getYouTubeId(videoUrl);
    const displayThumbnail = thumbnailUrl || "/assets/images/listing/img_47.jpg"; // Fallback thumbnail

    // Don't render if it's not a valid YouTube URL (or handle other providers)
    if (!videoId) {
        console.warn("Invalid or non-YouTube video URL provided:", videoUrl);
        // Optionally render a direct link instead
        // return (
        //     <div className="property-video-tour">
        //         <h4>Video Tour</h4>
        //         <p><a href={videoUrl} target="_blank" rel="noopener noreferrer">Watch Video</a></p>
        //     </div>
        // );
        return null; // Or return null if only YouTube is supported
    }


    return (
        <>
            <h4 className="mb-40">Video Tour</h4>
            <div className="bg-white shadow4 border-20 p-15">
                <div className="position-relative border-15 image-bg overflow-hidden z-1">
                    <img src={displayThumbnail} alt="Video Tour Thumbnail" className="lazy-img w-100" />
                    <button // Changed to button for accessibility
                        onClick={() => setIsVideoOpen(true)}
                        style={{ cursor: "pointer", background: 'rgba(0,0,0,0.4)', border: 'none' }} // Basic styling
                        className="video-icon tran3s rounded-circle d-flex align-items-center justify-content-center"
                        aria-label="Play Video Tour" // Accessibility
                    >
                        <i className="fa-thin fa-play" style={{ color: 'white', fontSize: '24px' }}></i>
                    </button>
                </div>
            </div>
            {/* Video Popup Modal */}
            <VideoPopup
                isVideoOpen={isVideoOpen}
                setIsVideoOpen={setIsVideoOpen}
                videoId={videoId} // Pass the extracted YouTube ID
            />
        </>
    );
};

export default CommonPropertyVideoTour;