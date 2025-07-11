import React from 'react';

const ReviewStep = ({ formData, onPrevious, onGenerate, isGenerating, status, generatedZip }) => {
  return (
    <div className="step-content">
      <h2>🔍 Review & Generate</h2>
      <p>Review your configuration and generate your FRC robot project.</p>
      
      <div className="review-section">
        <h3>📋 Project Information</h3>
        <div className="review-grid">
          <div className="review-item">
            <strong>Team Number:</strong>
            <span>{formData.teamNumber}</span>
          </div>
          <div className="review-item">
            <strong>Team Name:</strong>
            <span>{formData.teamName}</span>
          </div>
          <div className="review-item">
            <strong>Project Name:</strong>
            <span>{formData.projectName}</span>
          </div>
        </div>
      </div>

      <div className="review-section">
        <h3>🚗 Drivetrain Configuration</h3>
        <div className="review-grid">
          <div className="review-item">
            <strong>Type:</strong>
            <span>Swerve Drive (Phoenix 6)</span>
          </div>
          <div className="review-item">
            <strong>Wheel Diameter:</strong>
            <span>{formData.wheelDiameter || '4'}" inches</span>
          </div>
          <div className="review-item">
            <strong>Drive Gear Ratio:</strong>
            <span>{formData.driveGearRatio || '6.14'}:1</span>
          </div>
          <div className="review-item">
            <strong>Steer Gear Ratio:</strong>
            <span>{formData.steerGearRatio || '15.43'}:1</span>
          </div>
          <div className="review-item">
            <strong>CANivore:</strong>
            <span>{formData.useCANivore ? `Yes (${formData.canivoreSerial || 'No serial'})` : 'No'}</span>
          </div>
        </div>
      </div>

      <div className="review-section">
        <h3>⚡ Additional Features</h3>
        <div className="features-summary">
          {formData.includePathPlanner && (
            <div className="feature-summary">
              <span className="feature-icon">🛤️</span>
              <div>
                <strong>PathPlanner Integration</strong>
                <p>Autonomous path planning and following</p>
              </div>
            </div>
          )}
          {formData.includeVision && (
            <div className="feature-summary">
              <span className="feature-icon">👁️</span>
              <div>
                <strong>Vision Processing</strong>
                <p>AprilTag detection with PhotonVision</p>
              </div>
            </div>
          )}
          {!formData.includePathPlanner && !formData.includeVision && (
            <p className="no-features">No additional features selected</p>
          )}
        </div>
      </div>

      <div className="generation-section">
        <h3>🎯 What Will Be Generated</h3>
        <div className="generation-details">
          <ul>
            <li>Complete FRC robot project structure</li>
            <li>Phoenix 6 swerve drivetrain implementation</li>
            <li>Configured build.gradle with your team number</li>
            <li>WPILib preferences with team settings</li>
            <li>All necessary vendor dependencies</li>
            {formData.includePathPlanner && <li>PathPlanner integration and commands</li>}
            {formData.includeVision && <li>PhotonVision subsystem and pose estimation</li>}
            <li>Ready-to-deploy robot code</li>
          </ul>
        </div>
      </div>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      {generatedZip && (
        <div className="download-section">
          <h3>✅ Project Generated Successfully!</h3>
          <p>Your FRC robot project has been generated and is ready for download.</p>
          <button 
            className="download-btn"
            onClick={async () => {
              try {
                console.log('Starting download...');
                const blob = await generatedZip.generateAsync({ type: 'blob' });
                console.log('ZIP blob generated successfully');
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formData.projectName}.zip`;
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                console.log('Download completed successfully');
              } catch (error) {
                console.error('Download failed:', error);
                alert(`Download failed: ${error.message}`);
              }
            }}
          >
            📥 Download {formData.projectName}.zip
          </button>
          <div className="next-steps">
            <h4>Next Steps:</h4>
            <ol>
              <li>Extract the ZIP file</li>
              <li>Open the project in VS Code with WPILib extension</li>
              <li>Configure hardware IDs in TunerConstants.java</li>
              <li>Build and deploy to your robot</li>
            </ol>
          </div>
        </div>
      )}

      <div className="step-actions">
        <button 
          className="btn btn-secondary"
          onClick={onPrevious}
          disabled={isGenerating}
        >
          ← Previous
        </button>
        <button 
          className="btn btn-primary generate-btn"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Generating...' : '🚀 Generate Project'}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
