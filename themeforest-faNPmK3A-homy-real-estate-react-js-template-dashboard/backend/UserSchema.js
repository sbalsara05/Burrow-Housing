const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        majors_minors: [String],
        school_attending: {
            type: String,
            enum: ["Northeastern University", "Other University"],
            required: true,
        },
      phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return /\+?[1-9]\d{1,14}$/.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`,
            },
            required: true,
        },
        about: String,
        avatar: { type: String, default: 'default-avatar.png' },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);


module.exports = mongoose.model('User', UserSchema);
