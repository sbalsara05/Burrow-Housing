const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User schema
        username: { type: String},
        school_email: { type: String }, // Unique email
        majors_minors: { type: String},
        school_attending: { type: String },
        about: { type: String },
        image: { type: String }, // Image field to store the image URL or path
    },
    { timestamps: true }
);

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
