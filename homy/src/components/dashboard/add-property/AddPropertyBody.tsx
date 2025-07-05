import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppDispatch } from '../../../redux/slices/store';
import { addNewProperty, selectIsAddingProperty, selectPropertyError, clearPropertyError } from '../../../redux/slices/propertySlice';
import Overview from "./Overview";
import ListingDetails from "./ListingDetails";
import SelectAmenities from "./SelectAmenities";
import AddressAndLocation from "../profile/AddressAndLocation";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import PhotoUploader from './PhotoUploader';
import { Link } from "react-router-dom";

// Define the shape for our component's state
type FormDataShape = {
    overview: { title: string; category: string; roomType: string; neighborhood: string; rent: number | ''; };
    listingDetails: { size?: number | ''; bedrooms: number; bathrooms: number; floorNo: number; };
    amenities: string[];
    addressAndLocation: { address: string; };
    buildingName: string;
    leaseLength: string;
    description: string;
};

// Initial state with default values
const initialFormData: FormDataShape = {
    overview: { title: '', category: '', roomType: '', neighborhood: 'Any', rent: '' },
    listingDetails: { bedrooms: 1, bathrooms: 1, floorNo: 1, size: '' },
    amenities: [],
    addressAndLocation: { address: '' },
    leaseLength: '',
    description: '',
    buildingName: '',
};

const AddPropertyBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const isAdding = useSelector(selectIsAddingProperty);
    const error = useSelector(selectPropertyError);

    const [formData, setFormData] = useState<FormDataShape>(initialFormData);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

    useEffect(() => {
        dispatch(clearPropertyError());
    }, [dispatch]);

    // A single, robust handler for all nested form data changes
    const handleNestedChange = (section: keyof FormDataShape, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...(prev[section] as object), [field]: value }
        }));
    };
    
    // A single handler for all top-level form data changes
    const handleTopLevelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for the amenities checkboxes
    const handleAmenityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        const currentAmenities = formData.amenities || [];
        const newAmenities = checked
            ? [...currentAmenities, value]
            : currentAmenities.filter(a => a !== value);
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(clearPropertyError());

        // --- Client-side Validation ---
        if (!formData.overview.category || !formData.overview.roomType || formData.overview.neighborhood === 'Any' || !formData.overview.rent) {
            toast.error("Please complete all required fields in the Overview section."); return;
        }
        if (!formData.addressAndLocation.address) { toast.error("Please provide the property address."); return; }
        if (!location.lat || !location.lng) { toast.error("Please select a location on the map."); return; }
        if (filesToUpload.length === 0) { toast.error("Please upload at least one image."); return; }
        if (!formData.leaseLength || !formData.description) { toast.error("Please provide Lease Length and Description."); return; }

        // Construct the final data object for the Redux thunk
        const propertyData = {
            overview: {
                ...formData.overview,
                rent: Number(formData.overview.rent) || 0,
            },
            listingDetails: {
                ...formData.listingDetails,
                size: Number(formData.listingDetails.size) || undefined,
            },
            amenities: formData.amenities,
            addressAndLocation: {
                address: formData.addressAndLocation.address,
                location: { lat: location.lat, lng: location.lng },
            },
            buildingName: formData.buildingName,
            leaseLength: formData.leaseLength,
            description: formData.description,
        };

        const resultAction = await dispatch(addNewProperty({ propertyData, files: filesToUpload }));

        if (addNewProperty.fulfilled.match(resultAction)) {
            toast.success("Property added successfully!");
            setFormData(initialFormData);
            setFilesToUpload([]);
            setLocation({ lat: 0, lng: 0 });
            navigate('/dashboard/properties-list');
        } else {
            toast.error(resultAction.payload as string || "Failed to add property.");
        }
    };

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Add New Property" />
                <h2 className="main-title d-block d-lg-none">Add New Property</h2>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {location.lat !== 0 && <div className="alert alert-success mt-3">✅ Location selected on map.</div>}

                <form onSubmit={handleSubmit}>
                    <div className="bg-white card-box border-20">
                        <h4 className="dash-title-three">Property Details</h4>
                        <div className="dash-input-wrapper mb-30">
                            <label htmlFor="propertyTitle">Property Title (Optional)</label>
                            <input type="text" id="propertyTitle" placeholder="e.g., Cozy 2-Bedroom near Fenway" value={formData.overview.title} onChange={(e) => handleNestedChange('overview', 'title', e.target.value)} />
                        </div>
                        <Overview overviewData={formData.overview} handleInputChange={(field, value) => handleNestedChange('overview', field, value)} />
                    </div>
                    
                    <ListingDetails detailsData={formData.listingDetails} handleInputChange={(field, value) => handleNestedChange('listingDetails', field, value)} />
                    
                    <PhotoUploader onFilesChange={setFilesToUpload} currentFiles={filesToUpload} disabled={isAdding} />

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
                        <button type="submit" className="dash-btn-two tran3s me-3" disabled={isAdding}>{isAdding ? "Submitting..." : "Submit Property"}</button>
                        <Link to="/dashboard/profile" className="dash-cancel-btn tran3s">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyBody;