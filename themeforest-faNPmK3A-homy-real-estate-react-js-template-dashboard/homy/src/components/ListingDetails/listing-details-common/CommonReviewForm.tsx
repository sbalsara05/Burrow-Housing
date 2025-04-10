// frontend/components/ListingDetails/listing-details-common/CommonReviewForm.tsx
import React, { useState } from 'react'; // Import React
import AgencyFormOne from "../../forms/AgencyFormOne"; // Assuming this is the actual form layout
import LoginModal from "../../../modals/LoginModal"; // Adjust path

// Define props interface
interface CommonReviewFormProps {
    propertyId?: string | null; // ID of the property being reviewed
}

const CommonReviewForm: React.FC<CommonReviewFormProps> = ({ propertyId }) => {
    const [loginModal, setLoginModal] = useState<boolean>(false);

    // Modify AgencyFormOne later to accept propertyId and include it in submission
    // Or handle submission logic here directly if AgencyFormOne is too generic

    return (
        <>
            <h4 className="mb-20">Leave A Reply</h4>
            <p className="fs-20 lh-lg pb-15">
                <a onClick={() => setLoginModal(true)} style={{ cursor: "pointer" }} data-bs-toggle="modal" data-bs-target="#loginModal"
                    className="color-dark fw-500 text-decoration-underline">Sign in</a> to post your comment or
                signup if you don't have any account.
            </p>

            {/* Pass propertyId to the underlying form component OR handle submission here */}
            {/* If AgencyFormOne handles submission, modify it to accept propertyId */}
            <AgencyFormOne style={true} propertyId={propertyId} />
            {/* Alternatively, create a specific ReviewSubmitForm here */}

            {/* Login Modal remains the same */}
            <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
        </>
    );
};

export default CommonReviewForm;

// --- You would also need to modify AgencyFormOne or create a new form ---
// Example modification for AgencyFormOne:
/*
// frontend/components/forms/AgencyFormOne.tsx
import React from 'react';
// ... other imports ...

interface AgencyFormOneProps {
    style?: boolean;
    propertyId?: string | null; // Add propertyId prop
}

const AgencyFormOne: React.FC<AgencyFormOneProps> = ({ style, propertyId }) => {
    // ... form state and schema ...
    const onSubmit = (data: FormData) => {
        // Include propertyId in the submission data
        const submissionData = { ...data, propertyId };
        console.log("Submitting review:", submissionData);
        // TODO: Add API call logic here to submit the review
        const notify = () => toast('Review submitted (simulation)', { position: 'top-center' });
        notify();
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={/ * ... * /}>
            {propertyId && <input type="hidden" name="propertyId" value={propertyId} />} // Add hidden input
            // ... rest of form fields ...
            <button type='submit' className={/ * ... * /}>Post Review</button>
        </form>
    );
};
export default AgencyFormOne;
*/