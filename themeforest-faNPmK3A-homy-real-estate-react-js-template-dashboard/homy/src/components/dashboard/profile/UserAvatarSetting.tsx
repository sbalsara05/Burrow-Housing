import React, { useState } from "react";
import axios from "axios";

const UserAvatarSetting = () => {
    const [formData, setFormData] = useState({
        username: "",
        majors_minors: "",
        school_attending: "",
        about: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/users", formData);
            console.log("User created:", response.data);
            alert("User created successfully!");
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user. Check the console for details.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12">
                    <div className="dash-input-wrapper mb-30">
                        <label>Username*</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
{/*                 <div className="col-sm-6">
                    <div className="dash-input-wrapper mb-30">
                        <label>First Name*</label>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="dash-input-wrapper mb-30">
                        <label>Last Name*</label>
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div> */}
                <div className="col-sm-6">
                    <div className="dash-input-wrapper mb-30">
                        <label>School Email*</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@school.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="dash-input-wrapper mb-30">
                        <label>Majors and/or Minors*</label>
                        <input
                            type="text"
                            name="majors_minors"
                            placeholder="Major and Minors"
                            value={formData.majors_minors}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="dash-input-wrapper mb-30">
                        <label>I am Attending:</label>
                        <input
                            type="text"
                            name="school_attending"
                            placeholder="Northeastern University"
                            value={formData.school_attending}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                {/* <div className="col-sm-6">
                    <div className="dash-input-wrapper mb-30">
                        <label>Phone Number*</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="+123 456 7890"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div> */}
                <div className="col-12">
                    <div className="dash-input-wrapper">
                        <label>About*</label>
                        <textarea
                            name="about"
                            className="size-lg"
                            placeholder="Talk about yourself..."
                            value={formData.about}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                </div>
                {/* <div className="col-12">
                    <button type="submit" className="btn btn-orange">
                        Save Profile
                    </button>
                </div> */}
            </div>
        </form>
    );
};

export default UserAvatarSetting;
