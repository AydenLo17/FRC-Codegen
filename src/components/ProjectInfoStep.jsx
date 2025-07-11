import React from 'react';

const ProjectInfoStep = ({ formData, onFormDataChange, onNext }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({ ...formData, [name]: value });
  };

  const validateForm = () => {
    return formData.teamNumber && 
           formData.teamName && 
           formData.projectName && 
           /^\d+$/.test(formData.teamNumber);
  };

  return (
    <div className="step-content">
      <h2>📋 Project Information</h2>
      <p>Let's start with the basic information for your FRC robot project.</p>
      
      <div className="form-group">
        <label htmlFor="teamNumber">Team Number</label>
        <input
          type="text"
          id="teamNumber"
          name="teamNumber"
          value={formData.teamNumber}
          onChange={handleChange}
          placeholder="e.g., 5712"
          pattern="[0-9]+"
          required
        />
        <small>Your FRC team number (numbers only)</small>
      </div>

      <div className="form-group">
        <label htmlFor="teamName">Team Name</label>
        <input
          type="text"
          id="teamName"
          name="teamName"
          value={formData.teamName}
          onChange={handleChange}
          placeholder="e.g., Hemlock"
          required
        />
        <small>Your team's name or nickname</small>
      </div>

      <div className="form-group">
        <label htmlFor="projectName">Project Name</label>
        <input
          type="text"
          id="projectName"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          placeholder="e.g., 2025-Robot"
          required
        />
        <small>The name for your robot code project</small>
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary"
          onClick={onNext}
          disabled={!validateForm()}
        >
          Next: Drivetrain Setup →
        </button>
      </div>
    </div>
  );
};

export default ProjectInfoStep;
