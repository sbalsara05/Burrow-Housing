// import React, { useState } from "react";
// import Overview from "./Overview";
// import ListingDetails from "./ListingDetails";
// import SelectAmenities from "./SelectAmenities";
// import AddressAndLocation from "../profile/AddressAndLocation";
// import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
// import { Link } from "react-router-dom";
//
// const AddPropertyBody = () => {
//    const [attachedFiles, setAttachedFiles] = useState([]);
//
//    // Handle file upload
//    const handleFileChange = (event) => {
//       const files = Array.from(event.target.files);
//       setAttachedFiles((prevFiles) => [...prevFiles, ...files]);
//    };
//
//    // Handle file removal
//    const removeFile = (fileName) => {
//       setAttachedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
//    };
//
//    return (
//       <div className="dashboard-body">
//          <div className="position-relative">
//             <DashboardHeaderTwo title="Add New Property" />
//             <h2 className="main-title d-block d-lg-none">Add New Property</h2>
//             <Overview />
//             <ListingDetails />
//
//             <div className="bg-white card-box border-20 mt-40">
//                <h4 className="dash-title-three">Photo & Video Attachment</h4>
//                <div className="dash-input-wrapper mb-20">
//                   <label htmlFor="">File Attachment*</label>
//
//                   {attachedFiles.map((file, index) => (
//                      <div key={index} className="attached-file d-flex align-items-center justify-content-between mb-15">
//                         <span>{file.name}</span>
//                         <Link to="#" className="remove-btn" onClick={() => removeFile(file.name)}>
//                            <i className="bi bi-x"></i>
//                         </Link>
//                      </div>
//                   ))}
//                </div>
//
//                <div className="dash-btn-one d-inline-block position-relative me-3">
//                   <i className="bi bi-plus"></i>
//                   Upload File
//                   <input
//                      type="file"
//                      id="uploadCV"
//                      name="uploadCV"
//                      onChange={handleFileChange}
//                      multiple
//                      accept=".jpg, .png, .mp4"
//                   />
//                </div>
//                <small>Upload file .jpg, .png, .mp4</small>
//             </div>
//
//             <SelectAmenities />
//             <AddressAndLocation />
//
//             <div className="button-group d-inline-flex align-items-center mt-30">
//                <Link to="#" className="dash-btn-two tran3s me-3">Submit Property</Link>
//                <Link to="#" className="dash-cancel-btn tran3s">Cancel</Link>
//             </div>
//          </div>
//       </div>
//    );
// };
//
// export default AddPropertyBody;
import React, { useState } from "react";
import Overview from "./Overview";
import ListingDetails from "./ListingDetails";
import SelectAmenities from "./SelectAmenities";
import AddressAndLocation from "../profile/AddressAndLocation";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { Link } from "react-router-dom";

const AddPropertyBody = () => {
   const [property, setProperty] = useState({
      title: "",
      description: "",
      address: "",
      location: { lat: 0, lng: 0 },
      amenities: [],
      files: [],
   });

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

            <div className="button-group d-inline-flex align-items-center mt-30">
               <Link to="#" className="dash-btn-two tran3s me-3">Submit Property</Link>
               <Link to="#" className="dash-cancel-btn tran3s">Cancel</Link>
            </div>
         </div>
      </div>
   );
};

export default AddPropertyBody;
