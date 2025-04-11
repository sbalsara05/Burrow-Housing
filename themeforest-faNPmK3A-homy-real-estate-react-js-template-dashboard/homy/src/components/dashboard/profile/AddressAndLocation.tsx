// frontend/components/dashboard/profile/AddressAndLocation.tsx
// NOTE: Still simplified for property address string only.
import React from 'react';

// Define the shape of the data slice this component receives
interface AddressData {
    address: string;
    // Add lat/lng etc. if your model includes them later
}

// Define the props interface - Expects specific handler now
interface AddressAndLocationProps {
    addressData?: Partial<AddressData>; // Optional for initial render
    // Expect the specific handler from parent
    handleAddressChange: (value: string) => void;
}

const AddressAndLocation: React.FC<AddressAndLocationProps> = ({
    addressData = { address: '' }, // Default to empty object
    handleAddressChange // Receive specific handler
}) => {

    return (
        <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Address & Location</h4>
            <div className="row">
                {/* --- Simplified Address Input --- */}
                <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor="property-address">Full Address*</label>
                        <input
                            id="property-address"
                            type="text"
                            placeholder="e.g., 123 Main St, Boston, MA 02115"
                            // Use value from props.addressData
                            value={addressData?.address || ''} // Use optional chaining
                            // Call the specific handler passed via props
                            onChange={(e) => handleAddressChange(e.target.value)}
                            required
                        />
                    </div>
                </div>
                {/* --- State/City/Zip/Map Removed --- */}
            </div>
        </div>
    );
};

export default AddressAndLocation;