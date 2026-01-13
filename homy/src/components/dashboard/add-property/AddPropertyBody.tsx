import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { useSidebarCollapse } from '../../../hooks/useSidebarCollapse';
import {
    addNewProperty,
    updateUserProperty,
    getPresignedUrlsForUpload, // Thunk to get URLs for editing
    selectIsAddingProperty,
    selectPropertyError,
    clearPropertyError,
    Property
} from '../../../redux/slices/propertySlice';
import Overview from "./Overview";
import ListingDetails from "./ListingDetails";
import SelectAmenities from "./SelectAmenities";
import AddressAndLocation from "../profile/AddressAndLocation";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import PhotoUploader from './PhotoUploader';
import PropertyTypeToggle from './PropertyTypeToggle';
import NeighborhoodSelect from './NeighborhoodSelect';
import { Link } from "react-router-dom";

// Props for the component
interface AddPropertyBodyProps {
    isEditMode?: boolean;
    propertyToEdit?: Property | null;
}

// Shape for the form's state
type FormDataShape = {
    propertyType: string; // 'Apartment' or 'Room' - UI only, maps to category/roomType
    overview: { title: string; category: string; roomType: string; neighborhood: string; rent: number | ''; };
    listingDetails: { size?: number | ''; bedrooms: number; bathrooms: number; floorNo: number; };
    amenities: string[];
    addressAndLocation: {
        address: string;
        line1: string;
        line2: string;
        city: string;
        state: string;
        zip: string;
    };
    buildingName: string;
    leaseLength: string;
    description: string;
};

// Initial state for "Add" mode
const initialFormData: FormDataShape = {
    propertyType: 'Apartment', // UI toggle value
    overview: { title: '', category: 'Apartment', roomType: 'Single Room', neighborhood: 'Any', rent: '' },
    listingDetails: { bedrooms: 1, bathrooms: 1, floorNo: 1, size: '' },
    amenities: [],
    addressAndLocation: { address: '', line1: '', line2: '', city: '', state: '', zip: '' },
    leaseLength: '',
    description: '',
    buildingName: '',
};

const AddPropertyBody: React.FC<AddPropertyBodyProps> = ({ isEditMode = false, propertyToEdit }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const isCollapsed = useSidebarCollapse();
    const isSubmitting = useSelector(selectIsAddingProperty);
    const error = useSelector(selectPropertyError);

    const [formData, setFormData] = useState<FormDataShape>(initialFormData);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

    useEffect(() => {
        if (isEditMode && propertyToEdit) {
            // Map category to propertyType for UI
            const propertyType = propertyToEdit.overview?.category === 'Apartment' ? 'Apartment' : 'Room';
            // Preserve the roomType from the property
            const roomType = propertyToEdit.overview?.roomType || 'Single Room';
            setFormData({
                propertyType,
                overview: propertyToEdit.overview || { title: '', category: 'Apartment', roomType, neighborhood: 'Any', rent: '' },
                listingDetails: propertyToEdit.listingDetails || { bedrooms: 1, bathrooms: 1, floorNo: 1, size: '' },
                amenities: propertyToEdit.amenities || [],
                addressAndLocation: {
                    address: propertyToEdit.addressAndLocation?.address || '',
                    line1: propertyToEdit.addressAndLocation?.line1 || propertyToEdit.addressAndLocation?.address || '',
                    line2: propertyToEdit.addressAndLocation?.line2 || '',
                    city: propertyToEdit.addressAndLocation?.city || '',
                    state: propertyToEdit.addressAndLocation?.state || '',
                    zip: propertyToEdit.addressAndLocation?.zip || '',
                },
                leaseLength: propertyToEdit.leaseLength || '',
                description: propertyToEdit.description || '',
                buildingName: propertyToEdit.buildingName || '',
            });
            setLocation(propertyToEdit.addressAndLocation?.location || { lat: 0, lng: 0 });
            setExistingImageUrls(propertyToEdit.images || []);
            setFilesToUpload([]);
        } else {
            setFormData(initialFormData);
            setLocation({ lat: 0, lng: 0 });
            setExistingImageUrls([]);
            setFilesToUpload([]);
        }
    }, [isEditMode, propertyToEdit]);

    useEffect(() => {
        dispatch(clearPropertyError());
    }, [dispatch]);

    const handleNestedChange = (section: keyof FormDataShape, field: string, value: any) => {
        setFormData(prev => ({ ...prev, [section]: { ...(prev[section] as object), [field]: value } }));
    };

    const handleTopLevelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePropertyTypeChange = (propertyType: string) => {
        setFormData(prev => {
            // Map propertyType to category and roomType for backend
            const category = propertyType === 'Apartment' ? 'Apartment' : 'Single Room';
            // Keep existing roomType if switching to Room, otherwise default to Single Room
            const roomType = propertyType === 'Room' 
                ? (prev.overview.roomType || 'Single Room')
                : 'Single Room';
            return {
                ...prev,
                propertyType,
                overview: {
                    ...prev.overview,
                    category,
                    roomType,
                },
            };
        });
    };

    const handleRoomTypeChange = (roomType: string) => {
        setFormData(prev => ({
            ...prev,
            overview: {
                ...prev.overview,
                roomType,
            },
        }));
    };

    const handleAmenityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        const currentAmenities = formData.amenities || [];
        const newAmenities = checked ? [...currentAmenities, value] : currentAmenities.filter(a => a !== value);
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(clearPropertyError());

        // Build full address from parts
        const { line1, line2, city, state, zip } = formData.addressAndLocation;
        const composedAddress = [
            line1,
            line2,
            [city, state].filter(Boolean).join(', '),
            zip,
        ]
            .filter((part) => part && part.trim().length > 0)
            .join(', ');

        // Client-side Validation
        if (!line1 || !city || !state || !zip || !location.lat || !location.lng) {
            toast.error("Please complete the address fields and select it on the map.");
            return;
        }

        if (isEditMode && propertyToEdit) {
            // --- EDIT MODE LOGIC ---
            let newImageUrls: string[] = [];
            if (filesToUpload.length > 0) {
                try {
                    const fileInfo = filesToUpload.map(f => ({ filename: f.name, contentType: f.type }));
                    const uploadTargets = await dispatch(getPresignedUrlsForUpload({ files: fileInfo })).unwrap();

                    await Promise.all(
                        uploadTargets.map((target, index) =>
                            fetch(target.signedUrl, { method: 'PUT', body: filesToUpload[index], headers: { 'Content-Type': filesToUpload[index].type, 'x-amz-acl': 'public-read' } })
                        )
                    );
                    newImageUrls = uploadTargets.map(t => t.publicUrl);
                } catch (uploadError: any) {
                    toast.error(uploadError || "Failed to upload new images.");
                    return;
                }
            }

            const finalImageUrls = [...existingImageUrls, ...newImageUrls];
            const propertyData = {
                ...formData,
                images: finalImageUrls,
                addressAndLocation: {
                    ...formData.addressAndLocation,
                    address: composedAddress,
                    location,
                },
            };

            const resultAction = await dispatch(updateUserProperty({ propertyId: propertyToEdit._id, propertyData }));

            if (updateUserProperty.fulfilled.match(resultAction)) {
                toast.success("Property updated successfully!");
                navigate('/dashboard/properties-list');
            } else {
                toast.error(resultAction.payload as string || "Failed to update property.");
            }
        } else {
            // --- ADD MODE LOGIC ---
            if (filesToUpload.length === 0) {
                toast.error("Please upload at least one image for a new listing.");
                return;
            }
            const propertyData = {
                ...formData,
                addressAndLocation: {
                    ...formData.addressAndLocation,
                    address: composedAddress,
                    location,
                },
            };
            const resultAction = await dispatch(addNewProperty({ propertyData, files: filesToUpload }));

            if (addNewProperty.fulfilled.match(resultAction)) {
                toast.success("Property added successfully!");
                setFormData(initialFormData);
                setFilesToUpload([]);
                setLocation({ lat: 0, lng: 0 });
                setExistingImageUrls([]);
                navigate('/dashboard/properties-list');
            } else {
                toast.error(resultAction.payload as string || "Failed to add property.");
            }
        }
    };

    const pageTitle = isEditMode ? "Edit Property" : "Add New Property";

    return (
        <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="position-relative">
                <DashboardHeaderTwo title={pageTitle} />
                <h2 className="main-title d-block d-lg-none">{pageTitle}</h2>
                {error && <div className="alert alert-danger mt-3">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="bg-white card-box border-20">
                        {/* Property Type Toggle */}
                        <div className="dash-input-wrapper mb-40">
                            <label className="d-block mb-3">Property Type</label>
                            <PropertyTypeToggle 
                                propertyType={formData.propertyType}
                                roomType={formData.overview.roomType}
                                onPropertyTypeChange={handlePropertyTypeChange}
                                onRoomTypeChange={handleRoomTypeChange}
                            />
                        </div>

                        {/* Monthly Rent */}
                        <div className="dash-input-wrapper mb-40">
                            <label htmlFor="monthlyRent">Monthly Rent</label>
                            <input 
                                type="number" 
                                id="monthlyRent" 
                                placeholder="Enter monthly rent" 
                                value={formData.overview.rent || ''} 
                                onChange={(e) => handleNestedChange('overview', 'rent', e.target.value === '' ? '' : parseFloat(e.target.value))} 
                                required 
                                min="0"
                            />
                        </div>

                        {/* Property Details - 2x2 Grid */}
                        <div className="dash-input-wrapper mb-40">
                            <label className="d-block mb-3">Property Details</label>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="dash-input-wrapper mb-30">
                                        <label htmlFor="squareFootage">Square Footage</label>
                                        <input
                                            type="number"
                                            id="squareFootage"
                                            placeholder="e.g., 1200"
                                            value={formData.listingDetails.size || ''}
                                            onChange={(e) => handleNestedChange('listingDetails', 'size', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="dash-input-wrapper mb-30">
                                        <label htmlFor="bathrooms">Number of Bathrooms</label>
                                        <input
                                            type="number"
                                            id="bathrooms"
                                            placeholder="e.g., 2"
                                            value={formData.listingDetails.bathrooms || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                handleNestedChange('listingDetails', 'bathrooms', val === '' ? '' : parseInt(val) || '');
                                            }}
                                            onBlur={(e) => {
                                                // If empty on blur, set to 1 (required field)
                                                if (e.target.value === '') {
                                                    handleNestedChange('listingDetails', 'bathrooms', 1);
                                                }
                                            }}
                                            required
                                            min="1"
                                            max="3"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="dash-input-wrapper mb-30">
                                        <label htmlFor="bedrooms">Number of Bedrooms</label>
                                        <input
                                            type="number"
                                            id="bedrooms"
                                            placeholder="e.g., 2"
                                            value={formData.listingDetails.bedrooms || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                handleNestedChange('listingDetails', 'bedrooms', val === '' ? '' : parseInt(val) || '');
                                            }}
                                            onBlur={(e) => {
                                                // If empty on blur, set to 1 (required field)
                                                if (e.target.value === '') {
                                                    handleNestedChange('listingDetails', 'bedrooms', 1);
                                                }
                                            }}
                                            required
                                            min="1"
                                            max="5"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="dash-input-wrapper mb-30">
                                        <label htmlFor="floors">Number of Floors</label>
                                        <input
                                            type="number"
                                            id="floors"
                                            placeholder="e.g., 1"
                                            value={formData.listingDetails.floorNo || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                handleNestedChange('listingDetails', 'floorNo', val === '' ? '' : parseInt(val) || '');
                                            }}
                                            onBlur={(e) => {
                                                // If empty on blur, set to 0 (required field)
                                                if (e.target.value === '') {
                                                    handleNestedChange('listingDetails', 'floorNo', 0);
                                                }
                                            }}
                                            required
                                            min="0"
                                            max="5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Neighborhood - Keep as requested */}
                        <div className="dash-input-wrapper mb-40">
                            <label htmlFor="neighborhood">Neighborhood*</label>
                            <NeighborhoodSelect 
                                value={formData.overview.neighborhood} 
                                onChange={(value) => handleNestedChange('overview', 'neighborhood', value)} 
                            />
                        </div>

                        {/* Lease Length */}
                        <div className="dash-input-wrapper mb-40">
                            <label htmlFor="leaseLength">Lease Length*</label>
                            <input 
                                type="text" 
                                id="leaseLength"
                                name="leaseLength"
                                placeholder="e.g., 12 Months" 
                                value={formData.leaseLength} 
                                onChange={handleTopLevelChange} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Photos */}
                    <PhotoUploader
                        onFilesChange={setFilesToUpload}
                        currentFiles={filesToUpload}
                        existingImageUrls={existingImageUrls}
                        onExistingUrlsChange={setExistingImageUrls}
                        isEditMode={isEditMode}
                        disabled={isSubmitting}
                    />

                    {/* Amenities */}
                    <div className="bg-white card-box border-20 mt-40">
                        <h4 className="dash-title-three m0 pb-5">Amenities</h4>
                        <SelectAmenities selected={formData.amenities} onChange={handleAmenityChange} />
                    </div>

                    {/* Address - Simplified but keep map */}
                    <AddressAndLocation
                        location={location}
                        setLocation={setLocation}
                        addressData={formData.addressAndLocation}
                        handleAddressChange={(field, value) => handleNestedChange('addressAndLocation', field, value)}
                    />

                    {/* Description - Large textarea */}
                    <div className="bg-white card-box border-20 mt-40">
                        <div className="dash-input-wrapper mb-30">
                            <label htmlFor="description">Description*</label>
                            <textarea 
                                name="description" 
                                id="description" 
                                className="size-lg" 
                                placeholder="Write about the property..." 
                                value={formData.description} 
                                onChange={handleTopLevelChange} 
                                required 
                                rows={8}
                                style={{ minHeight: '200px' }}
                            ></textarea>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="button-group d-inline-flex align-items-center mt-30">
                        <button type="submit" className="dash-btn-two tran3s me-3" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Listing"}
                        </button>
                        <Link to="/dashboard/properties-list" className="dash-cancel-btn tran3s">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyBody;