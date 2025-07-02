// frontend/components/ListingDetails/listing-details-sidebar/ScheduleForm.tsx
import React from 'react'; // Import React

// Define props interface
interface ScheduleFormProps {
    propertyTitle?: string | null;
    propertyId?: string | null;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ propertyTitle, propertyId }) => {

    const defaultMessage = `Hello, I am interested in scheduling a tour for "${propertyTitle || 'this property'}" (ID: ${propertyId || 'N/A'}).`;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Add form submission logic here (e.g., send data to an API)
        console.log("Schedule form submitted for property:", propertyId);
        alert("Tour request submitted (simulation)."); // Placeholder
        // Optionally clear form fields
    };


    return (
        // Add onSubmit handler to the form
        <form onSubmit={handleSubmit}>
            <div className="input-box-three mb-25">
                <div className="label">Your Name*</div>
                <input type="text" name="name" placeholder="Your full name" className="type-input" required />
            </div>
            <div className="input-box-three mb-25">
                <div className="label">Your Email*</div>
                <input type="email" name="email" placeholder="Enter mail address" className="type-input" required />
            </div>
            <div className="input-box-three mb-25">
                <div className="label">Your Phone*</div>
                <input type="tel" name="phone" placeholder="Your phone number" className="type-input" required />
            </div>
            <div className="input-box-three mb-15">
                <div className="label">Message*</div>
                {/* Use defaultValue for the textarea */}
                <textarea name="message" placeholder="Your message" defaultValue={defaultMessage} required></textarea>
            </div>
            {/* Optional: Hidden input to include property ID */}
            {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
            <button type="submit" className="btn-nine text-uppercase rounded-3 w-100 mb-10">INQUIRY</button>
        </form>
    );
};

export default ScheduleForm;