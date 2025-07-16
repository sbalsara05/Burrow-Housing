const UserAvatarSetting = ({ formData, handleChange }) => {
  return (
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
      <div className="col-sm-6">
        <div className="dash-input-wrapper mb-30">
          <label>School Email*</label>
          <input
            type="email"
            name="school_email"
            placeholder="name@school.com"
            value={formData.school_email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="col-sm-6">
        <div className="dash-input-wrapper mb-30">
          <label>Majors and/or Minors</label>
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
      <div className="col-12">
        <div className="dash-input-wrapper">
          <label>About</label>
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
    </div>
  );
};

export default UserAvatarSetting;
