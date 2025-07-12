import { useState } from 'react';
import JSZip from 'jszip';
import StepIndicator from './StepIndicator';
import ProjectInfoStep from './ProjectInfoStep';
import DrivetrainStep from './DrivetrainStep';
import FeaturesStep from './FeaturesStep';
import ReviewStep from './ReviewStep';

const ProjectGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Project Info
    teamNumber: '',
    teamName: '',
    projectName: '',
    
    // Drivetrain Config
    drivetrainType: 'swerve',
    wheelDiameter: '4',
    driveGearRatio: '6.14',
    steerGearRatio: '15.43',
    useCANivore: false,
    canivoreSerial: '',
    
    // Features
    includePathPlanner: false,
    includeVision: false
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedZip, setGeneratedZip] = useState(null);

  const stepNames = ['Project Info', 'Drivetrain', 'Features', 'Generate'];
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  // Fetch files from GitHub with branch support
  const fetchFileFromGitHub = async (path, branch = 'main') => {
    const baseUrl = `https://api.github.com/repos/Hemlock5712/2025-Workshop/contents`;
    const url = `${baseUrl}/${path}?ref=${branch}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path} from ${branch}: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle single file
      if (data.type === 'file') {
        const content = data.content ? atob(data.content) : '';
        return { 
          path: data.path, 
          content, 
          type: 'file',
          name: data.name 
        };
      }
      
      throw new Error(`Unexpected data type for ${path}`);
    } catch (error) {
      console.error(`Error fetching ${path} from ${branch}:`, error);
      throw error;
    }
  };

  // Method to fetch the entire repository structure recursively from a specific branch
  const fetchRepositoryStructure = async (path = '', branch = 'main') => {
    const baseUrl = `https://api.github.com/repos/Hemlock5712/2025-Workshop/contents`;
    const url = path ? `${baseUrl}/${path}?ref=${branch}` : `${baseUrl}?ref=${branch}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path || 'root'} from ${branch}: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const files = [];
      
      if (Array.isArray(data)) {
        for (const item of data) {
          // Skip .vscode folder as requested
          if (item.name === '.vscode' || item.name === '.git') {
            continue;
          }
          
          if (item.type === 'file') {
            // Handle binary files that don't have content in the API response
            let content = '';
            if (item.content) {
              content = atob(item.content);
            } else {
              // For files without content (usually binary), we need to fetch them separately
              try {
                const fileResponse = await fetch(item.download_url);
                if (fileResponse.ok) {
                  const blob = await fileResponse.blob();
                  content = await blob.text();
                }
              } catch (e) {
                console.warn(`Could not fetch content for ${item.path}:`, e.message);
                content = `// Binary file: ${item.name}\n// Original URL: ${item.download_url}`;
              }
            }
            
            files.push({ 
              path: item.path, 
              content, 
              type: 'file',
              name: item.name 
            });
          } else if (item.type === 'dir') {
            const subFiles = await fetchRepositoryStructure(item.path, branch);
            files.push(...subFiles);
          }
        }
      }
      
      return files;
    } catch (error) {
      console.error(`Error fetching ${path || 'root'} from ${branch}:`, error);
      throw error;
    }
  };

  // Merge files from multiple branches
  const mergeRepositoryFiles = async () => {
    console.log('Starting to merge repository files...');
    
    let baseFiles;
    try {
      console.log('Fetching base files from main branch...');
      baseFiles = await fetchRepositoryStructure('', 'main');
      console.log(`Fetched ${baseFiles.length} base files from main branch`);
    } catch (error) {
      console.error('Failed to fetch base files from main branch:', error);
      throw new Error(`Failed to fetch base files: ${error.message}`);
    }
    
    let allFiles = [...baseFiles];
    
    // Add PathPlanner files if selected
    if (formData.includePathPlanner) {
      try {
        console.log('Fetching PathPlanner files from 6-PathPlanner branch...');
        const pathPlannerFiles = await fetchRepositoryStructure('', '6-PathPlanner');
        console.log(`Fetched ${pathPlannerFiles.length} PathPlanner files`);
        
        // Merge files, with PathPlanner branch taking precedence for conflicts
        for (const file of pathPlannerFiles) {
          const existingIndex = allFiles.findIndex(f => f.path === file.path);
          if (existingIndex >= 0) {
            // Replace existing file
            allFiles[existingIndex] = file;
            console.log(`Replaced ${file.path} with PathPlanner version`);
          } else {
            // Add new file
            allFiles.push(file);
            console.log(`Added new PathPlanner file: ${file.path}`);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch PathPlanner files, continuing without them:', error.message);
        setStatus({ type: 'loading', message: 'PathPlanner files unavailable, continuing with base project...' });
      }
    }
    
    // Add Vision files if selected
    if (formData.includeVision) {
      try {
        console.log('Fetching Vision files from 7-Vision branch...');
        const visionFiles = await fetchRepositoryStructure('', '7-Vision');
        console.log(`Fetched ${visionFiles.length} Vision files`);
        
        // Merge files, with Vision branch taking precedence for conflicts
        for (const file of visionFiles) {
          const existingIndex = allFiles.findIndex(f => f.path === file.path);
          if (existingIndex >= 0) {
            // Replace existing file
            allFiles[existingIndex] = file;
            console.log(`Replaced ${file.path} with Vision version`);
          } else {
            // Add new file
            allFiles.push(file);
            console.log(`Added new Vision file: ${file.path}`);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch Vision files, continuing without them:', error.message);
        setStatus({ type: 'loading', message: 'Vision files unavailable, continuing with base project...' });
      }
    }
    
    console.log(`Final merged files count: ${allFiles.length}`);
    return allFiles;
  };

  const processJavaFile = (content, teamNumber, teamName, projectName) => {
    let processedContent = content;
    
    // Add team information as comments at the top of Java files
    if (content.includes('package frc.robot')) {
      const teamComment = `// Team ${teamNumber}: ${teamName}\n// Project: ${projectName}\n// Generated by FRC Code Generator\n\n`;
      processedContent = content.replace(
        /(package frc\.robot[^;]*;)/,
        `$1\n\n${teamComment}`
      );
    }
    
    return processedContent;
  };

  const processGradleFile = (content, teamNumber) => {
    // Replace team number in build.gradle
    return content.replace(/team\s*=\s*\d+/g, `team = ${teamNumber}`);
  };

  const processWPILibPreferences = (content, teamNumber) => {
    try {
      const preferences = JSON.parse(content);
      preferences.teamNumber = parseInt(teamNumber);
      return JSON.stringify(preferences, null, 2);
    } catch (error) {
      console.warn('Could not parse WPILib preferences, creating new one:', error);
      return JSON.stringify({
        "enableCppIntellisense": false,
        "currentLanguage": "java",
        "projectYear": "2025",
        "teamNumber": parseInt(teamNumber)
      }, null, 2);
    }
  };

  const processTunerConstants = (content, formData) => {
    let processedContent = content;
    
    // Update drivetrain constants
    if (formData.wheelDiameter) {
      processedContent = processedContent.replace(
        /kWheelRadiusInches\s*=\s*[\d.]+/g,
        `kWheelRadiusInches = ${parseFloat(formData.wheelDiameter) / 2}`
      );
    }
    
    if (formData.driveGearRatio) {
      processedContent = processedContent.replace(
        /kDriveGearRatio\s*=\s*[\d.]+/g,
        `kDriveGearRatio = ${formData.driveGearRatio}`
      );
    }
    
    if (formData.steerGearRatio) {
      processedContent = processedContent.replace(
        /kSteerGearRatio\s*=\s*[\d.]+/g,
        `kSteerGearRatio = ${formData.steerGearRatio}`
      );
    }
    
    // CANivore configuration
    if (formData.useCANivore && formData.canivoreSerial) {
      processedContent = processedContent.replace(
        /kCANivoreSerial\s*=\s*"[^"]*"/g,
        `kCANivoreSerial = "${formData.canivoreSerial}"`
      );
    }
    
    return processedContent;
  };

  const generateProject = async () => {
    setIsGenerating(true);
    setStatus({ type: 'loading', message: 'Fetching project files from GitHub...' });
    
    try {
      // Fetch all files from the repository and selected branches
      console.log('Fetching files from repository and selected branches...');
      
      let allFiles;
      try {
        allFiles = await mergeRepositoryFiles();
        console.log(`Successfully fetched ${allFiles.length} files from repository`);
        console.log('Files fetched:', allFiles.map(f => f.path));
      } catch (error) {
        console.warn('Failed to fetch complete repository, trying fallback approach:', error.message);
        setStatus({ type: 'loading', message: 'Trying fallback approach to fetch files...' });
        
        // Fallback: just fetch main branch files
        try {
          allFiles = await fetchRepositoryStructure('', 'main');
          console.log(`Fallback: Successfully fetched ${allFiles.length} files from main branch`);
          setStatus({ type: 'loading', message: 'Using base project files (advanced features may be unavailable)...' });
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw new Error(`Failed to fetch project files: ${fallbackError.message}`);
        }
      }
      
      setStatus({ type: 'loading', message: 'Processing project files and applying customizations...' });
      
      // Validate we got files
      if (!allFiles || allFiles.length === 0) {
        throw new Error('No files found in the repository. Please check the repository structure.');
      }

      // Create ZIP file
      const zip = new JSZip();
      
      // Create project structure
      const projectFolder = zip.folder(formData.projectName);
      
      // Process and add all files
      for (const file of allFiles) {
        let content = file.content;
        const fileName = file.path;
        
        // Process specific file types
        if (fileName.endsWith('.java')) {
          content = processJavaFile(content, formData.teamNumber, formData.teamName, formData.projectName);
          
          // Special handling for TunerConstants
          if (fileName.includes('TunerConstants.java')) {
            content = processTunerConstants(content, formData);
          }
        } else if (fileName.includes('build.gradle')) {
          content = processGradleFile(content, formData.teamNumber);
        } else if (fileName.includes('wpilib_preferences.json')) {
          content = processWPILibPreferences(content, formData.teamNumber);
        }
        
        // Create the file in the appropriate location
        const pathParts = fileName.split('/');
        let currentFolder = projectFolder;
        
        // Navigate to the correct folder
        for (let i = 0; i < pathParts.length - 1; i++) {
          currentFolder = currentFolder.folder(pathParts[i]);
        }
        
        // Add the file
        const finalFileName = pathParts[pathParts.length - 1];
        currentFolder.file(finalFileName, content);
      }
      
      // Add README
      const readme = `# ${formData.projectName}

**Team ${formData.teamNumber}: ${formData.teamName}**

This is an FRC robot project generated using the FRC Code Generator.

## Project Structure

This project contains a Phoenix 6 swerve drivetrain implementation based on the 2025 workshop code.

### Key Features
- Phoenix 6 Swerve Drivetrain
- Command-based robot structure
- Telemetry and logging
- SysId characterization support
- Complete vendor dependencies
- WPILib preferences configured
${formData.includePathPlanner ? '- PathPlanner integration for autonomous' : ''}
${formData.includeVision ? '- PhotonVision integration for AprilTag detection' : ''}

## Building and Deploying

1. Make sure you have WPILib installed
2. Open this project in VS Code with the WPILib extension
3. Use Ctrl+Shift+P to open the command palette
4. Run "WPILib: Build Robot Code" to build
5. Run "WPILib: Deploy Robot Code" to deploy to the robot

## Configuration

- Team number is set to ${formData.teamNumber} in build.gradle and WPILib preferences
- Configure hardware IDs in TunerConstants.java for your robot
- Adjust swerve module constants as needed
- Wheel diameter: ${formData.wheelDiameter}" inches
- Drive gear ratio: ${formData.driveGearRatio}:1
- Steer gear ratio: ${formData.steerGearRatio}:1
${formData.useCANivore ? `- CANivore configured with serial: ${formData.canivoreSerial}` : ''}

## Support

For help with this code:
- Check the [WPILib documentation](https://docs.wpilib.org/)
- Visit the [Phoenix 6 documentation](https://v6.docs.ctr-electronics.com/)
${formData.includePathPlanner ? '- View [PathPlanner documentation](https://pathplanner.dev/)' : ''}
${formData.includeVision ? '- Check [PhotonVision documentation](https://docs.photonvision.org/)' : ''}
- Ask on the [FRC Discord](https://discord.gg/frc)

Generated from: https://github.com/Hemlock5712/2025-Workshop
${formData.includePathPlanner ? 'PathPlanner: https://github.com/Hemlock5712/2025-Workshop/tree/6-PathPlanner' : ''}
${formData.includeVision ? 'Vision: https://github.com/Hemlock5712/2025-Workshop/tree/7-Vision' : ''}
`;

      projectFolder.file('README.md', readme);
      
      setStatus({ type: 'success', message: 'Project generated successfully! Ready for download.' });
      setGeneratedZip(zip);
      
    } catch (error) {
      console.error('Generation failed:', error);
      setStatus({ 
        type: 'error', 
        message: `Failed to generate project: ${error.message}` 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectInfoStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <DrivetrainStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <FeaturesStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ReviewStep
            formData={formData}
            onPrevious={handlePrevious}
            onGenerate={generateProject}
            isGenerating={isGenerating}
            status={status}
            generatedZip={generatedZip}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="project-generator">
      <div className="generator-header">
        <h1>🚀 FRC Code Generator</h1>
        <p>Generate a complete FRC robot project with Phoenix 6 swerve drivetrain</p>
      </div>
      
      <StepIndicator 
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepNames={stepNames}
      />
      
      <div className="generator-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default ProjectGenerator;
