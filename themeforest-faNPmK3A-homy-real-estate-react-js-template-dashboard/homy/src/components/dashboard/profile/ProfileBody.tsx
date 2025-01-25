import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import UserAvatarSetting from "./UserAvatarSetting";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { toast } from "react-toastify";

const ProfileBody = () => {
  const [formData, setFormData] = useState({
    username: "",
    school_email: "",
    majors_minors: "",
    school_attending: "",
    about: "",
    image: null,
  });

  const [previewImage, setPreviewImage] = useState("/assets/images/dashboard/no-profile-pic.png");
  const [initialData, setInitialData] = useState(null); // For cancel functionality


  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is stored on login
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData({
            username: data.username || "",
            school_email: data.school_email || "",
            majors_minors: data.majors_minors || "",
            school_attending: data.school_attending || "",
            about: data.about || "",
            image: data.image || null,

          });
          setInitialData(data); // Save the initial data for cancel functionality
          setPreviewImage(
            data.image
              ? URL.createObjectURL(data.image) // Convert image if available
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        image: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSubmit = new FormData();

      // Append each form field to the FormData object
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key] === null ? "" : formData[key]); // Prevent sending 'null' as string
      });

      // Debugging: Check FormData content
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0] + ": " + pair[1]); // Log each field to verify data
      }

      const response = await axios.put("http://localhost:3000/api/profile", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setInitialData(formData); // Update initialData after successful save
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile.");
    }
  };


  const handleCancel = () => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        school_email: initialData.school_email || "",
        majors_minors: initialData.majors_minors || "",
        school_attending: initialData.school_attending || "",
        about: initialData.about || "",
        image: initialData.image || null,
      });
      setPreviewImage(
        initialData.image
          ? URL.createObjectURL(initialData.image) // Reset image preview
          : "/assets/images/dashboard/no-profile-pic.png"
      );
    }
  };

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Profile" />
        <h2 className="main-title d-block d-lg-none">Profile</h2>

        <div className="bg-white card-box border-20">
          <form onSubmit={handleSubmit}>
            <div className="user-avatar-setting d-flex align-items-center mb-30">
              <img src={previewImage} alt="Profile Preview" className="lazy-img user-img" />
              <div className="upload-btn position-relative tran3s ms-4 me-3">
                Upload new photo
                <input type="file" id="uploadImg" name="image" onChange={handleImageChange} />
              </div>
              <button
                type="button"
                className="delete-btn tran3s"
                onClick={() => {
                  setPreviewImage("/assets/images/dashboard/no-profile-pic.png");
                  setFormData({ ...formData, image: null });
                }}
              >
                Delete
              </button>
            </div>
            <UserAvatarSetting formData={formData} handleChange={handleChange} />
            <div className="button-group d-inline-flex align-items-center mt-30">
              <button type="submit" className="dash-btn-two tran3s me-3">
                Save
              </button>
              <button type="button" className="dash-cancel-btn tran3s" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileBody;