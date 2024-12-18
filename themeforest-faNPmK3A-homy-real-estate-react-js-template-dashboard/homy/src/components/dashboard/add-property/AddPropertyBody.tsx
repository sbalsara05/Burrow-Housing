import React, { useState } from "react";
import Overview from "./Overview";
import ListingDetails from "./ListingDetails";
import SelectAmenities from "./SelectAmenities";
import AddressAndLocation from "../profile/AddressAndLocation";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AddPropertyBody = () => {
   const navigate = useNavigate();

   const [property, setProperty] = useState({
      title: "",
      description: "",
      address: "",
      location: { lat: 0, lng: 0 },
      amenities: [],
      files: [],
   });
   const [selectedCityInput, setSelectedCityInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Handle input changes
   const handleInputChange = (event) => {
      const { name, value } = event.target;
      setProperty((prevProperty) => ({
         ...prevProperty,
         [name]: value,
      }));
   };

   // Handle file upload
   const handleFileChange = (event) => {
      const files = Array.from(event.target.files);
      setProperty((prevProperty) => ({
         ...prevProperty,
         files: [...prevProperty.files, ...files],
      }));
   };

   // Handle file removal
   const removeFile = (fileName) => {
      setProperty((prevProperty) => ({
         ...prevProperty,
         files: prevProperty.files.filter((file) => file.name !== fileName),
      }));
   };

   // Handle location change
   const updateLocation = (location) => {
      setProperty((prevProperty) => ({
         ...prevProperty,
         location,
      }));
   };

   // Submit Property
   const handleSubmit = async () => {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      Object.keys(property).forEach((key) => {
         if (key === "files") {
            property.files.forEach((file) => {
               formData.append("files", file);
            });
         } else {
            formData.append(key, JSON.stringify(property[key]));
         }
      });

      try {
         const response = await axios.post(
            "/api/properties/add",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
         );
         console.log("Property added successfully", response.data);
         navigate("/dashboard/properties"); // Redirect after success
      } catch (err) {
         console.error("Error adding property:", err);
         setError("Failed to submit the property. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="dashboard-body">
         <div className="position-relative">
            <DashboardHeaderTwo title="Add New Property" />
            <h2 className="main-title d-block d-lg-none">Add New Property</h2>
            <Overview />
            <ListingDetails />

            <div className="bg-white card-box border-20 mt-40">
               <h4 className="dash-title-three">Photo & Video Attachment</h4>
               <div className="dash-input-wrapper mb-20">
                  <label htmlFor="">File Attachment*</label>

                  {property.files.map((file, index) => (
                     <div
                        key={index}
                        className="attached-file d-flex align-items-center justify-content-between mb-15"
                     >
                        <span>{file.name}</span>
                        <Link to="#" className="remove-btn" onClick={() => removeFile(file.name)}>
                           <i className="bi bi-x"></i>
                        </Link>
                     </div>
                  ))}
               </div>

               <div className="dash-btn-one d-inline-block position-relative me-3">
                  <i className="bi bi-plus"></i>
                  Upload File
                  <input
                     type="file"
                     id="uploadCV"
                     name="uploadCV"
                     onChange={handleFileChange}
                     multiple
                     accept=".jpg, .png, .mp4"
                  />
               </div>
               <small>Upload file .jpg, .png, .mp4</small>
            </div>

            <SelectAmenities />

            <AddressAndLocation location={property.location} setLocation={updateLocation} />

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <div className="button-group d-inline-flex align-items-center mt-30">
               <button
                  className="dash-btn-two tran3s me-3"
                  onClick={handleSubmit}
                  disabled={loading}
               >
                  {loading ? "Submitting..." : "Submit Property"}
               </button>
               <Link to="#" className="dash-cancel-btn tran3s">
                  Cancel
               </Link>
            </div>
         </div>
      </div>
   );
};

export default AddPropertyBody;
