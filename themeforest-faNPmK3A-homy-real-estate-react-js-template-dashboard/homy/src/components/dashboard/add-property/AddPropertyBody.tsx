// frontend/components/dashboard/add-property/AddPropertyBody.tsx
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from 'react-redux';
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {AppDispatch} from '../../../redux/slices/store.ts';
import {
    addNewProperty,
    selectIsAddingProperty,
    selectPropertyError,
    clearPropertyError,
    // fetchUserPropertyIds,
    // Property
} from '../../../redux/slices/propertySlice';

// Import sub-components
import Overview from "./Overview";
import ListingDetails from "./ListingDetails";
import SelectAmenities from "./SelectAmenities";
import AddressAndLocation from "../profile/AddressAndLocation"; // Using the modified version for property address
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";

// Define the structure matching backend expectations for the thunk payload
interface NewPropertyData {
    overview: { category: string; roomType: string; neighborhood: string; rent: number; };
    listingDetails: { size?: number; bedrooms: number; bathrooms: number; floorNo: number; };
    amenities?: string[];
    addressAndLocation: { address: string; lat: number; lng: number; }; // 👈 UPDATED: Added lat/lng
    buildingName?: string;
    leaseLength: string;
    description: string;
}

const initialFormData: Partial<NewPropertyData> = {
    overview: {category: '', roomType: '', neighborhood: 'Any', rent: 0},
    listingDetails: {bedrooms: 1, bathrooms: 1, floorNo: 1, size: undefined},
    amenities: [],
    addressAndLocation: {address: '', lat: 0, lng: 0}, // 👈 UPDATED: Added lat/lng
    leaseLength: '',
    description: '',
    buildingName: '',
};

const AddPropertyBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const isAdding = useSelector(selectIsAddingProperty);
    const error = useSelector(selectPropertyError);

    // --- Local State for ALL Form Fields ---
    const [formData, setFormData] = useState<Partial<NewPropertyData>>(initialFormData);
    // 👈 ADDED: Location state to track coordinates from the map
    const [location, setLocation] = useState({lat: 0, lng: 0});

    // Clear errors on mount
    useEffect(() => {
        dispatch(clearPropertyError());
    }, [dispatch]);

    // --- Generic Handler for NON-ADDRESS nested fields ---
    const handleNestedInputChange = (
        section: 'overview' | 'listingDetails', // Only for these sections now
        field: string,
        value: any
    ) => {
        setFormData(prev => {
            console.log(`Updating nested field: ${section}.${field} =`, value);
            const currentSectionData = prev[section] || {};
            return {
                ...prev,
                [section]: {
                    ...currentSectionData,
                    [field]: value
                }
            };
        });
    };

    // --- Generic Handler for TOP-LEVEL fields ---
    const handleTopLevelInputChange = (
        field: 'leaseLength' | 'description' | 'buildingName', // Specify valid top-level fields
        value: string
    ) => {
        console.log(`Updating top-level field: ${field} =`, value);
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // --- Specific handler for the address field ---
    const handleAddressChange = (value: string) => {
        console.log(`Updating address =`, value);
        setFormData(prev => ({
            ...prev,
            addressAndLocation: {
                ...(prev.addressAndLocation || {}), // Keep other potential fields like lat/lng later
                address: value // Update only the address field
            }
        }));
    };

    // Specific handler for amenities (checkboxes)
    const handleAmenityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value, checked} = event.target;
        setFormData(prev => {
            const currentAmenities = prev.amenities || [];
            if (checked) {
                if (!currentAmenities.includes(value)) {
                    return {...prev, amenities: [...currentAmenities, value]};
                }
            } else {
                return {...prev, amenities: currentAmenities.filter(a => a !== value)};
            }
            return prev;
        });
    };

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(clearPropertyError());

        // --- Validation (Client-side before sending) ---
        if (!formData.overview?.category) {
            toast.error("Please select a Category.");
            return;
        }
        if (!formData.overview?.roomType) {
            toast.error("Please select a Room Type.");
            return;
        }
        if (!formData.overview?.neighborhood || formData.overview.neighborhood === 'Any') {
            toast.error("Please select a Neighborhood.");
            return;
        }
        if (!formData.overview?.rent || formData.overview.rent <= 0) {
            toast.error("Please enter a valid Rent amount.");
            return;
        }
        if (!formData.listingDetails?.bedrooms) {
            toast.error("Please select the number of Bedrooms.");
            return;
        }
        if (!formData.listingDetails?.bathrooms) {
            toast.error("Please select the number of Bathrooms.");
            return;
        }
        if (formData.listingDetails?.floorNo === undefined) {
            toast.error("Please select the Floor Number.");
            return;
        }
        if (!formData.addressAndLocation?.address) {
            toast.error("Please provide the property address.");
            return;
        }
        // 👈 ADDED: Validate coordinates
        if (!location.lat || !location.lng || location.lat === 0 || location.lng === 0) {
            toast.error("Please select a valid location on the map.");
            return;
        }
        if (!formData.leaseLength) {
            toast.error("Please specify the lease length.");
            return;
        }
        if (!formData.description) {
            toast.error("Please add a description.");
            return;
        }

        console.log("Submitting Property Data:", formData);
        console.log("Location coordinates:", location); // 👈 ADDED: Log coordinates

        // Structure the data for the API/Thunk
        const submissionData: NewPropertyData = {
            overview: {
                category: formData.overview.category!,
                roomType: formData.overview.roomType!,
                neighborhood: formData.overview.neighborhood!,
                rent: Number(formData.overview.rent) || 0,
            },
            listingDetails: {
                bedrooms: Number(formData.listingDetails.bedrooms) || 1,
                bathrooms: Number(formData.listingDetails.bathrooms) || 1,
                floorNo: Number(formData.listingDetails.floorNo) ?? 0,
                size: formData.listingDetails.size ? Number(formData.listingDetails.size) : undefined,
            },
            amenities: formData.amenities || [],
            addressAndLocation: {
                address: formData.addressAndLocation.address!,
                lat: location.lat,  // 👈 ADDED: Include coordinates
                lng: location.lng,  // 👈 ADDED: Include coordinates
            },
            buildingName: formData.buildingName || undefined,
            leaseLength: formData.leaseLength!,
            description: formData.description!,
        };

        // Dispatch the thunk with the structured data object
        const resultAction = await dispatch(addNewProperty(submissionData));

        if (addNewProperty.fulfilled.match(resultAction)) {
            toast.success("Property added successfully!");
            setFormData(initialFormData); // Reset form state locally after success
            setLocation({lat: 0, lng: 0}); // 👈 ADDED: Reset location coordinates
            // navigate('/dashboard/properties-list'); // Optional: Navigate after success
        } else if (addNewProperty.rejected.match(resultAction)) {
            toast.error(resultAction.payload as string || "Failed to add property.");
        }
    };

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Add New Property"/>
                <h2 className="main-title d-block d-lg-none">Add New Property</h2>

                {error && <div className="alert alert-danger mt-3">{error}</div>}

                {/* 👈 ADDED: Show coordinate status */}
                {location.lat !== 0 && location.lng !== 0 && (
                    <div className="alert alert-success mt-3">
                        ✅ Location selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Overview Component */}
                    <Overview
                        overviewData={formData.overview}
                        handleInputChange={(field, value) => handleNestedInputChange('overview', field, value)}
                    />
                    {/* Listing Details Component */}
                    <ListingDetails
                        detailsData={formData.listingDetails}
                        handleInputChange={(field, value) => handleNestedInputChange('listingDetails', field, value)}
                    />

                    {/* Photo Attachment Placeholder */}
                    <div className="bg-white card-box border-20 mt-40">
                        <h4 className="dash-title-three">Photo Attachment (Disabled)</h4>
                        <p>Image upload functionality will be added later.</p>
                    </div>

                    {/* Amenities Selection */}
                    <div className="bg-white card-box border-20 mt-40">
                        <h4 className="dash-title-three m0 pb-5">Select Amenities</h4>
                        <SelectAmenities
                            selected={formData.amenities || []}
                            onChange={handleAmenityChange}
                        />
                    </div>

                    {/* 👈 UPDATED: Address Component - Now includes location coordinates */}
                    <AddressAndLocation
                        location={location}
                        setLocation={setLocation}
                        addressData={formData.addressAndLocation}
                        handleAddressChange={handleAddressChange}
                    />

                    {/* Additional Details Section */}
                    <div className="bg-white card-box border-20 mt-40">
                        <h4 className="dash-title-three">Additional Details</h4>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="dash-input-wrapper mb-30">
                                    <label htmlFor="leaseLength">Lease Length*</label>
                                    <input
                                        type="text"
                                        id="leaseLength"
                                        placeholder="e.g., 12 Months, Month-to-Month"
                                        value={formData.leaseLength || ''}
                                        // Use generic handler for top-level fields
                                        onChange={(e) => handleTopLevelInputChange('leaseLength', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="dash-input-wrapper mb-30">
                                    <label htmlFor="buildingName">Building Name (Optional)</label>
                                    <input
                                        type="text"
                                        id="buildingName"
                                        placeholder="e.g., The Grand Apartments"
                                        value={formData.buildingName || ''}
                                        onChange={(e) => handleTopLevelInputChange('buildingName', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="dash-input-wrapper mb-30">
                                    <label htmlFor="description">Description*</label>
                                    <textarea
                                        id="description"
                                        className="size-lg"
                                        placeholder="Write about the property..."
                                        value={formData.description || ''}
                                        onChange={(e) => handleTopLevelInputChange('description', e.target.value)}
                                        required
                                        rows={5}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Submit Buttons */}
                    <div className="button-group d-inline-flex align-items-center mt-30">
                        <button
                            type="submit"
                            className="dash-btn-two tran3s me-3"
                            disabled={isAdding}
                        >
                            {isAdding ? "Submitting..." : "Submit Property"}
                        </button>
                        <Link to="/dashboard/profile" className="dash-cancel-btn tran3s">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyBody;