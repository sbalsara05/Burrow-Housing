import React, { useState, useEffect } from "react";
import Overview from "./Overview";
import ListingDetails from "./ListingDetails";
import SelectAmenities from "./SelectAmenities";
import AddressAndLocation from "../profile/AddressAndLocation";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Added toast import

const AddPropertyBody = () => {
   const navigate = useNavigate();

   const [property, setProperty] = useState({
      overview: {
         category: "",
         neighborhood: "",
         rent: 0
      },
      listingDetails: {
         size: 0,
         bedrooms: 0,
         bathrooms: 0,
         floorNo: 0
      },
      image: null,
      address: "",
      location: { lat: 0, lng: 0 },
      amenities: [],
      files: [],
   });
   const [previewImage, setPreviewImage] = useState("/assets/images/dashboard/no-profile-pic.png");
   const [initialData, setInitialData] = useState(null); // For cancel functionality
   const [selectedCityInput, setSelectedCityInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
       const fetchProfile = async () => {
         try {
           const response = await fetch("http://localhost:3000/api/properties", {
             method: "GET",
             headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${localStorage.getItem("token")}`,
             },
           });
           if (response.ok) {
             const data = await response.json();
             if (!data || !data.data) {
               console.error("Invalid data structure:", data);
               return;
             }
             setProperty({
               overview: {
                 category: data.data.category || "",
                 neighborhood: data.data.neighborhood || "",
                 rent: Number(data.data.rent) || 0,
               },
               listingDetails: {
                 size: Number(data.data.size) || 0,
                 bedrooms: Number(data.data.bedrooms) || 0,
                 bathrooms: Number(data.data.bathrooms) || 0,
                 floorNo: Number(data.data.floorNo) || 0,
               },
               image: data.data.image || null,
               amenities: data.data.amenities || [],
               address: data.data.address || "",
               location: data.data.location || { lat: 0, lng: 0 },
               files: [] // Ensure files is initialized
             });
             setInitialData(data);
             setPreviewImage(
               data.data.image
                 ? URL.createObjectURL(data.data.image)
                 : "/assets/images/dashboard/no-profile-pic.png"
             );
           } else {
             toast.error("Failed to fetch user data.");
           }
         } catch (error) {
           console.error("Error fetching user data:", error);
         }
       };

       fetchProfile();
     }, []);

   // Handle input changes
   const handleInputChange = (event) => {
      const { name, value } = event.target;
      setProperty((prevProperty) => ({
         ...prevProperty,
         [name]: value,
      }));
   };

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setProperty((prevData) => ({
          ...prevData,
          image: file,
        }));
        setPreviewImage(URL.createObjectURL(file));
      }
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
         const response = await axios.post("http://localhost:3000/api/properties/add", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },}
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
