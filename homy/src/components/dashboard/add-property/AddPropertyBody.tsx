import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from '../../../redux/slices/store';
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
import { Link } from "react-router-dom";

// Props for the component
interface AddPropertyBodyProps {
    isEditMode?: boolean;
    propertyToEdit?: Property | null;
}

// Shape for the form's state
type FormDataShape = {
    overview: { title: string; category: string; roomType: string; neighborhood: string; rent: number | ''; };
    listingDetails: { size?: number | ''; bedrooms: number; bathrooms: number; floorNo: number; };
    amenities: string[];
    addressAndLocation: { address: string; };
    buildingName: string;
    leaseLength: string;
    description: string;
};

// Initial state for "Add" mode
const initialFormData: FormDataShape = {
    overview: { title: '', category: '', roomType: '', neighborhood: 'Any', rent: '' },
    listingDetails: { bedrooms: 1, bathrooms: 1, floorNo: 1, size: '' },
    amenities: [],
    addressAndLocation: { address: '' },
    leaseLength: '',
    description: '',
    buildingName: '',
};

const AddPropertyBody: React.FC<AddPropertyBodyProps> = ({ isEditMode = false, propertyToEdit }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const isSubmitting = useSelector(selectIsAddingProperty);
    const error = useSelector(selectPropertyError);

    const [formData, setFormData] = useState<FormDataShape>(initialFormData);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

    useEffect(() => {
        if (isEditMode && propertyToEdit) {
            setFormData({
                overview: propertyToEdit.overview || { title: '', category: '', roomType: '', neighborhood: 'Any', rent: '' },
                listingDetails: propertyToEdit.listingDetails || { bedrooms: 1, bathrooms: 1, floorNo: 1, size: '' },
                amenities: propertyToEdit.amenities || [],
                addressAndLocation: { address: propertyToEdit.addressAndLocation?.address || '' },
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

    const handleAmenityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        const currentAmenities = formData.amenities || [];
        const newAmenities = checked ? [...currentAmenities, value] : currentAmenities.filter(a => a !== value);
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(clearPropertyError());

        // Client-side Validation
        if (!formData.addressAndLocation.address || !location.lat || !location.lng) {
            toast.error("Please provide a valid address and select it on the map.");
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
            const propertyData = { ...formData, images: finalImageUrls, addressAndLocation: { ...formData.addressAndLocation, location } };

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
            const propertyData = { ...formData, addressAndLocation: { ...formData.addressAndLocation, location } };
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
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title={pageTitle} />
                <h2 className="main-title d-block d-lg-none">{pageTitle}</h2>
                {error && <div className="alert alert-danger mt-3">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="bg-white card-box border-20">
                        <h4 className="dash-title-three">Property Details</h4>
                        <div className="dash-input-wrapper mb-30">
                            <label htmlFor="propertyTitle">Property Title*</label>
                            <input type="text" id="propertyTitle" placeholder="e.g., Cozy 2-Bedroom near Fenway" value={formData.overview.title} onChange={(e) => handleNestedChange('overview', 'title', e.target.value)} required />
                        </div>
                        <Overview overviewData={formData.overview} handleInputChange={(field, value) => handleNestedChange('overview', field, value)} />
                    </div>

                    <ListingDetails detailsData={formData.listingDetails} handleInputChange={(field, value) => handleNestedChange('listingDetails', field, value)} />

                    <PhotoUploader
                        onFilesChange={setFilesToUpload}
                        currentFiles={filesToUpload}
                        existingImageUrls={existingImageUrls}
                        onExistingUrlsChange={setExistingImageUrls}
                        isEditMode={isEditMode}
                        disabled={isSubmitting}
                    />

                    <div className="bg-white card-box border-20 mt-40">
                        <h4 className="dash-title-three m0 pb-5">Select Amenities</h4>
                        <SelectAmenities selected={formData.amenities} onChange={handleAmenityChange} />
                    </div>

                    <AddressAndLocation location={location} setLocation={setLocation} addressData={formData.addressAndLocation} handleAddressChange={(value) => handleNestedChange('addressAndLocation', 'address', value)} />

                    <div className="bg-white card-box border-20 mt-40">
                        <h4 className="dash-title-three">Additional Details</h4>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="dash-input-wrapper mb-30">
                                    <label htmlFor="leaseLength">Lease Length*</label>
                                    <input type="text" name="leaseLength" id="leaseLength" placeholder="e.g., 12 Months" value={formData.leaseLength} onChange={handleTopLevelChange} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="dash-input-wrapper mb-30">
                                    <label htmlFor="buildingName">Building Name (Optional)</label>
                                    <input type="text" name="buildingName" id="buildingName" placeholder="e.g., The Grand" value={formData.buildingName} onChange={handleTopLevelChange} />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="dash-input-wrapper mb-30">
                                    <label htmlFor="description">Description*</label>
                                    <textarea name="description" id="description" className="size-lg" placeholder="Write about the property..." value={formData.description} onChange={handleTopLevelChange} required rows={5}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="button-group d-inline-flex align-items-center mt-30">
                        <button type="submit" className="dash-btn-two tran3s me-3" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : (isEditMode ? "Save Changes" : "Submit Property")}
                        </button>
                        <Link to="/dashboard/properties-list" className="dash-cancel-btn tran3s">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyBody;