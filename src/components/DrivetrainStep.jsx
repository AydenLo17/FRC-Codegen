import React from 'react';

const DrivetrainStep = ({ formData, onFormDataChange, onNext, onPrevious }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  return (
    <div className="step-content">
      <h2>🚗 Drivetrain Configuration</h2>
      <p>Configure your swerve drivetrain settings. This will customize the TunerConstants.java file for your robot.</p>
      
      <div className="drivetrain-info">
        <div className="info-box">
          <h3>🎯 What You're Getting</h3>
          <ul>
            <li>Phoenix 6 Swerve Drivetrain implementation</li>
            <li>Command-based robot structure</li>
            <li>Telemetry and logging</li>
            <li>SysId characterization support</li>
            <li>Tuner X integration</li>
          </ul>
        </div>
      </div>

      <div className="form-section">
        <h3>Drivetrain Type</h3>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="drivetrainType"
              value="swerve"
              checked={formData.drivetrainType === 'swerve'}
              onChange={handleChange}
            />
            <div className="radio-content">
              <strong>Swerve Drive</strong>
              <span>Phoenix 6 swerve drivetrain (Recommended)</span>
            </div>
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Robot Configuration</h3>
        
        <div className="form-group">
          <label htmlFor="wheelDiameter">Wheel Diameter (inches)</label>
          <input
            type="number"
            id="wheelDiameter"
            name="wheelDiameter"
            value={formData.wheelDiameter || '4'}
            onChange={handleChange}
            step="0.1"
            min="2"
            max="8"
          />
          <small>Diameter of your drive wheels in inches</small>
        </div>

        <div className="form-group">
          <label htmlFor="driveGearRatio">Drive Gear Ratio</label>
          <input
            type="number"
            id="driveGearRatio"
            name="driveGearRatio"
            value={formData.driveGearRatio || '6.14'}
            onChange={handleChange}
            step="0.01"
            min="1"
            max="20"
          />
          <small>Gear ratio from motor to wheel (e.g., 6.14:1 = 6.14)</small>
        </div>

        <div className="form-group">
          <label htmlFor="steerGearRatio">Steer Gear Ratio</label>
          <input
            type="number"
            id="steerGearRatio"
            name="steerGearRatio"
            value={formData.steerGearRatio || '15.43'}
            onChange={handleChange}
            step="0.01"
            min="1"
            max="50"
          />
          <small>Gear ratio from motor to steering (e.g., 15.43:1 = 15.43)</small>
        </div>
      </div>

      <div className="form-section">
        <h3>CANivore Configuration</h3>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="useCANivore"
              checked={formData.useCANivore || false}
              onChange={handleChange}
            />
            Use CANivore
          </label>
          <small>Enable if you're using a CANivore CAN bus</small>
        </div>

        {formData.useCANivore && (
          <div className="form-group">
            <label htmlFor="canivoreSerial">CANivore Serial Number</label>
            <input
              type="text"
              id="canivoreSerial"
              name="canivoreSerial"
              value={formData.canivoreSerial || ''}
              onChange={handleChange}
              placeholder="e.g., 03050CAF"
            />
            <small>The serial number of your CANivore device</small>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-secondary"
          onClick={onPrevious}
        >
          ← Previous
        </button>
        <button 
          className="btn btn-primary"
          onClick={onNext}
        >
          Next: Additional Features →
        </button>
      </div>
    </div>
  );
};

export default DrivetrainStep;
