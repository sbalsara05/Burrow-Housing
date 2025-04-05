import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { toast } from "react-toastify";

const AccountSettingBody = () => {
   const [userData, setUserData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
   });
   const [originalData, setOriginalData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
   });

   const fetchUserData = async () => {
      try {
         const response = await fetch("http://localhost:3000/api/user", {
            method: "GET",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is stored on login
            },
         });
         if (response.ok) {
            const data = await response.json();
            setUserData({
               firstName: data.name.split(" ")[0] || "",
               lastName: data.name.split(" ").slice(1).join(" ") || "",
               email: data.email || "",
               phone: data.phone || "",
            });
            setOriginalData({
               firstName: data.name.split(" ")[0] || "",
               lastName: data.name.split(" ").slice(1).join(" ") || "",
               email: data.email || "",
               phone: data.phone || "",
            });
         } else {
            toast.error("Failed to fetch user data.");
         }
      } catch (error) {
         console.error("Error fetching user data:", error);
      }
   };

   useEffect(() => {
      fetchUserData();
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setUserData((prevData) => ({ ...prevData, [name]: value }));
   };

   const handleSave = async () => {
      try {
         const response = await fetch("http://localhost:3000/api/updateUser", {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
               name: `${userData.firstName} ${userData.lastName}`,
               phone: userData.phone,
            }),
         });
         if (response.ok) {
            toast.success("Profile updated successfully");
         } else {
            console.error("Failed to update user data.");
         }
      } catch (error) {
         console.error("Error updating user data:", error);
      }
   };

   const handleCancel = () => {
      //Reset to the original data when cancel is clicked
      setUserData({ ...originalData });
   };

   return (
      <div className="dashboard-body">
         <div className="position-relative">
            <DashboardHeaderTwo title="Account Settings" />
            <h2 className="main-title d-block d-lg-none">Account Settings</h2>
            <div className="bg-white card-box border-20">
               <h4 className="dash-title-three">Edit & Update</h4>
               <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row">
                     <div className="col-lg-6">
                        <div className="dash-input-wrapper mb-20">
                           <label htmlFor="firstName">First Name</label>
                           <input
                              type="text"
                              name="firstName"
                              placeholder="Rashed"
                              value={userData.firstName}
                              onChange={handleInputChange}
                           />
                        </div>
                     </div>
                     <div className="col-lg-6">
                        <div className="dash-input-wrapper mb-20">
                           <label htmlFor="lastName">Last Name</label>
                           <input
                              type="text"
                              name="lastName"
                              placeholder="Kabir"
                              value={userData.lastName}
                              onChange={handleInputChange}
                           />
                        </div>
                     </div>
                     <div className="col-12">
                        <div className="dash-input-wrapper mb-20">
                           <label htmlFor="email">Email</label>
                           <input
                              type="email"
                              name="email"
                              placeholder="rshakbair365@gmal.com"
                              value={userData.email}
                              onChange={handleInputChange}
                              disabled
                           />
                        </div>
                     </div>
                     <div className="col-12">
                        <div className="dash-input-wrapper mb-20">
                           <label htmlFor="phone">Phone Number</label>
                           <input
                              type="tel"
                              name="phone"
                              placeholder="+810 321 889 021"
                              value={userData.phone}
                              onChange={handleInputChange}
                           />
                        </div>
                     </div>
                     <div className="col-12">
                        <div className="dash-input-wrapper mb-20">
                           {/*  <label htmlFor="password">Password</label>
                           <input type="password" />*/}
                           <div className="info-text d-sm-flex align-items-center justify-content-between mt-5"> 
                           <p className="m0">
                              Want to change the password?
                              <Link to="/dashboard/account-settings/password-change">
                                 Click here
                              </Link>
                           </p>
                           </div>

                          
                           {/*        <Link to="/dashboard/account-settings/password-change" className="chng-pass">
                                 Change Password
                              </Link> */}
                        </div>
                     </div>
                  </div>

                  <div className="button-group d-inline-flex align-items-center mt-30">
                     <button
                        type="button"
                        className="dash-btn-two tran3s me-3"
                        onClick={handleSave}
                     >
                        Save
                     </button>
                     <button
                        type="button"
                        className="dash-cancel-btn tran3s"
                        onClick={handleCancel}
                     >
                        Cancel
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default AccountSettingBody;
