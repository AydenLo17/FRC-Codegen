import React from 'react';

const FeaturesStep = ({ formData, onFormDataChange, onNext, onPrevious }) => {
  const handleChange = (e) => {
    const { name, checked } = e.target;
    onFormDataChange({ 
      ...formData, 
      [name]: checked 
    });
  };

  return (
    <div className="step-content">
      <h2>⚡ Additional Features</h2>
      <p>Choose additional features to include in your robot project. These will add extra code and dependencies.</p>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-header">
            <input
              type="checkbox"
              id="includePathPlanner"
              name="includePathPlanner"
              checked={formData.includePathPlanner || false}
              onChange={handleChange}
              className="feature-checkbox"
            />
            <label htmlFor="includePathPlanner" className="feature-title">
              <h3>🛤️ PathPlanner Integration</h3>
            </label>
          </div>
          
          <div className="feature-content">
            <p>Autonomous path planning and following capabilities</p>
            
            <div className="feature-details">
              <h4>What's included:</h4>
              <ul>
                <li>PathPlanner vendor dependency</li>
                <li>Auto command integration</li>
                <li>Path following commands</li>
                <li>Auto chooser in dashboard</li>
                <li>Pre-configured path following</li>
              </ul>
            </div>
            
            <div className="feature-source">
              <strong>Source:</strong> <a href="https://github.com/Hemlock5712/2025-Workshop/tree/6-PathPlanner" target="_blank" rel="noopener noreferrer">
                Workshop Branch 6-PathPlanner
              </a>
            </div>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-header">
            <input
              type="checkbox"
              id="includeVision"
              name="includeVision"
              checked={formData.includeVision || false}
              onChange={handleChange}
              className="feature-checkbox"
            />
            <label htmlFor="includeVision" className="feature-title">
              <h3>👁️ Vision Processing</h3>
            </label>
          </div>
          
          <div className="feature-content">
            <p>AprilTag detection and pose estimation using PhotonVision</p>
            
            <div className="feature-details">
              <h4>What's included:</h4>
              <ul>
                <li>PhotonVision integration</li>
                <li>AprilTag pose estimation</li>
                <li>Vision subsystem</li>
                <li>Pose estimation with vision</li>
                <li>Field-relative odometry correction</li>
              </ul>
            </div>
            
            <div className="feature-source">
              <strong>Source:</strong> <a href="https://github.com/Hemlock5712/2025-Workshop/tree/7-Vision" target="_blank" rel="noopener noreferrer">
                Workshop Branch 7-Vision
              </a>
            </div>
          </div>
        </div>
      </div>

      {(formData.includePathPlanner || formData.includeVision) && (
        <div className="selected-features">
          <h3>📦 Selected Features</h3>
          <div className="selected-list">
            {formData.includePathPlanner && (
              <div className="selected-item">
                <span className="feature-icon">🛤️</span>
                <span>PathPlanner Integration</span>
              </div>
            )}
            {formData.includeVision && (
              <div className="selected-item">
                <span className="feature-icon">👁️</span>
                <span>Vision Processing</span>
              </div>
            )}
          </div>
        </div>
      )}

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
          Next: Review & Generate →
        </button>
      </div>
    </div>
  );
};

export default FeaturesStep;
