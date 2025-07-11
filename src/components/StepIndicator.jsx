import React from 'react';

const StepIndicator = ({ currentStep, totalSteps, stepNames }) => {
  return (
    <div className="step-indicator">
      <div className="step-progress">
        <div 
          className="step-progress-bar" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="step-labels">
        {stepNames.map((name, index) => (
          <div 
            key={index}
            className={`step-label ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 === currentStep ? 'current' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-name">{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
