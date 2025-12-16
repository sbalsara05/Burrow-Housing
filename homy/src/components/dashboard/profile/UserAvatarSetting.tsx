const UserAvatarSetting = ({ formData, handleChange }) => {
  return (
    <div className="profile-fields-grid">
      {/* Graduation Year | University Email (side-by-side) */}
      <div className="profile-field">
        <div className="dash-input-wrapper">
          <label>Graduation Year</label>
          <input
            type="text"
            name="expected_graduation_year"
            placeholder="Expected graduation year"
            value={formData.expected_graduation_year}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="profile-field">
        <div className="dash-input-wrapper">
          <label>University Email*</label>
          <input
            type="email"
            name="school_email"
            placeholder="your.email@university.edu"
            value={formData.school_email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      {/* University (full width) */}
      <div className="profile-field profile-field--full">
        <div className="dash-input-wrapper">
          <label>University</label>
          <input
            type="text"
            name="school_attending"
            placeholder="Enter your university name"
            value={formData.school_attending}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* About (full width) */}
      <div className="profile-field profile-field--full">
        <div className="dash-input-wrapper">
          <label>Tell us a bit about yourself*</label>
          <textarea
            name="about"
            className="size-lg"
            placeholder="Tell us a bit about yourself"
            value={formData.about}
            onChange={handleChange}
            required
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default UserAvatarSetting;
