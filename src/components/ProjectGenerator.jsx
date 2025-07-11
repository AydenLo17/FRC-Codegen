import { useState } from 'react';
import JSZip from 'jszip';

const ProjectGenerator = () => {
  const [formData, setFormData] = useState({
    teamNumber: '',
    teamName: '',
    projectName: ''
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedZip, setGeneratedZip] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.teamNumber.trim()) {
      setStatus({ type: 'error', message: 'Team number is required' });
      return false;
    }
    
    if (!/^\d{1,5}$/.test(formData.teamNumber.trim())) {
      setStatus({ type: 'error', message: 'Team number must be 1-5 digits' });
      return false;
    }
    
    if (!formData.teamName.trim()) {
      setStatus({ type: 'error', message: 'Team name is required' });
      return false;
    }
    
    if (!formData.projectName.trim()) {
      setStatus({ type: 'error', message: 'Project name is required' });
      return false;
    }
    
    return true;
  };

  const fetchFileFromGitHub = async (path) => {
    const baseUrl = 'https://api.github.com/repos/Hemlock5712/2025-Workshop/contents';
    const url = `${baseUrl}/${path}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle single file
      if (data.type === 'file') {
        const content = atob(data.content);
        return { path, content, type: 'file' };
      } 
      // Handle directory - data will be an array
      else if (Array.isArray(data)) {
        const files = [];
        for (const item of data) {
          if (item.type === 'file') {
            const fileContent = await fetchFileFromGitHub(item.path);
            files.push(fileContent);
          } else if (item.type === 'dir') {
            const dirContents = await fetchFileFromGitHub(item.path);
            if (Array.isArray(dirContents)) {
              files.push(...dirContents);
            } else {
              files.push(dirContents);
            }
          }
        }
        return files;
      }
      // Handle single directory object (shouldn't happen with GitHub API, but just in case)
      else if (data.type === 'dir') {
        // Re-fetch as the API should return array for directories
        return await fetchFileFromGitHub(path);
      }
      
      throw new Error(`Unexpected data type for ${path}`);
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      throw error;
    }
  };

  // Method to fetch the entire repository structure recursively
  const fetchRepositoryStructure = async (path = '') => {
    const baseUrl = 'https://api.github.com/repos/Hemlock5712/2025-Workshop/contents';
    const url = path ? `${baseUrl}/${path}` : baseUrl;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path || 'root'}: ${response.status} ${response.statusText}`);
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
            const subFiles = await fetchRepositoryStructure(item.path);
            files.push(...subFiles);
          }
        }
      }
      
      return files;
    } catch (error) {
      console.error(`Error fetching ${path || 'root'}:`, error);
      throw error;
    }
  };

  // Fallback method to fetch specific known files if full repo fetch fails
  const fetchKnownFiles = async () => {
    const knownFiles = [
      // Root level files
      '.gitignore',
      'WPILib-License.md',
      'build.gradle',
      'settings.gradle',
      'gradlew',
      'gradlew.bat',
      'tuner-project.json',
      
      // Gradle wrapper
      'gradle/wrapper/gradle-wrapper.jar',
      'gradle/wrapper/gradle-wrapper.properties',
      
      // WPILib preferences
      '.wpilib/wpilib_preferences.json',
      
      // Source files - main robot code
      'src/main/java/frc/robot/Main.java',
      'src/main/java/frc/robot/Robot.java',
      'src/main/java/frc/robot/RobotContainer.java',
      'src/main/java/frc/robot/Telemetry.java',
      
      // Generated constants
      'src/main/java/frc/robot/generated/TunerConstants.java',
      
      // Subsystems
      'src/main/java/frc/robot/subsystems/CommandSwerveDrivetrain.java',
      
      // Deploy directory
      'src/main/deploy/example.txt',
      
      // Vendor dependencies (actual names from repository)
      'vendordeps/Phoenix6-frc2025-latest.json',
      'vendordeps/WPILibNewCommands.json'
    ];
    
    const files = [];
    for (const filePath of knownFiles) {
      try {
        const file = await fetchFileFromGitHub(filePath);
        files.push(file);
      } catch (error) {
        console.warn(`Could not fetch ${filePath}:`, error.message);
      }
    }
    
    return files;
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

  const createWPILibPreferences = (teamNumber) => {
    return JSON.stringify({
      "enableCppIntellisense": false,
      "currentLanguage": "java",
      "projectYear": "2025",
      "teamNumber": parseInt(teamNumber)
    }, null, 2);
  };

  const generateProject = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    setStatus({ type: 'loading', message: 'Fetching latest code from GitHub...' });
      try {
      // Fetch all files from the repository
      setStatus({ type: 'loading', message: 'Fetching complete project from GitHub...' });
      console.log('Fetching complete repository structure...');
      
      let allFiles;
      try {
        allFiles = await fetchRepositoryStructure();
        console.log(`Successfully fetched ${allFiles.length} files from repository`);
        console.log('Files fetched:', allFiles.map(f => f.path));
      } catch (error) {
        console.warn('Failed to fetch complete repository, trying individual files:', error.message);
        setStatus({ type: 'loading', message: 'Fetching individual files from GitHub...' });
        allFiles = await fetchKnownFiles();
        console.log(`Fallback method fetched ${allFiles.length} files`);
        console.log('Fallback files:', allFiles.map(f => f.path));
      }
      
      console.log('Fetched files:', allFiles);
      
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
        } else if (fileName.includes('build.gradle')) {
          content = processGradleFile(content, formData.teamNumber);
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
      
      // Add WPILib preferences
      const wpiLibFolder = projectFolder.folder('.wpilib');
      wpiLibFolder.file('wpilib_preferences.json', createWPILibPreferences(formData.teamNumber));
      
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

## Support

For help with this code:
- Check the [WPILib documentation](https://docs.wpilib.org/)
- Visit the [Phoenix 6 documentation](https://v6.docs.ctr-electronics.com/)
- Ask on the [FRC Discord](https://discord.gg/frc)

Generated from: https://github.com/Hemlock5712/2025-Workshop
`;

      projectFolder.file('README.md', readme);
      
      setStatus({ type: 'success', message: 'Project generated successfully! Ready for download.' });
      setGeneratedZip(zip);
      
    } catch (error) {
      console.error('Error generating project:', error);
      setStatus({ 
        type: 'error', 
        message: `Failed to generate project: ${error.message}` 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadZip = async () => {
    if (!generatedZip) return;
    
    try {
      const content = await generatedZip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      setStatus({ type: 'error', message: 'Failed to download ZIP file' });
    }
  };

  return (
    <div className="project-generator">
      <h2>🔧 Generate Your Robot Code</h2>
      <p>Enter your team information to generate a customized FRC robot project</p>
      
      <form onSubmit={(e) => { e.preventDefault(); generateProject(); }}>
        <div className="form-group">
          <label htmlFor="teamNumber">Team Number *</label>
          <input
            type="text"
            id="teamNumber"
            name="teamNumber"
            value={formData.teamNumber}
            onChange={handleInputChange}
            placeholder="e.g. 1234"
            maxLength="5"
            pattern="[0-9]{1,5}"
            required
          />
          <small>Your FRC team number (1-5 digits)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="teamName">Team Name *</label>
          <input
            type="text"
            id="teamName"
            name="teamName"
            value={formData.teamName}
            onChange={handleInputChange}
            placeholder="e.g. The Robonauts"
            maxLength="50"
            required
          />
          <small>Your team's name for documentation</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="projectName">Project Name *</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            placeholder="e.g. 2025-Robot"
            maxLength="50"
            pattern="[a-zA-Z0-9_-]+"
            required
          />
          <small>Project folder name (letters, numbers, hyphens, and underscores only)</small>
        </div>
        
        <button 
          type="submit" 
          className="generate-btn"
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Generating...' : '🚀 Generate Project'}
        </button>
      </form>
      
      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
      
      {generatedZip && (
        <div className="download-section">
          <h3>✅ Project Ready!</h3>
          <p>Your customized FRC robot project has been generated and is ready for download.</p>
          <button onClick={downloadZip} className="download-btn">
            📦 Download {formData.projectName}.zip
          </button>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            <p><strong>Next steps:</strong></p>
            <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
              <li>Extract the ZIP file to your desired location</li>
              <li>Open the project in VS Code with the WPILib extension</li>
              <li>Configure hardware IDs in TunerConstants.java for your robot</li>
              <li>Build and deploy to your robot using WPILib commands</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGenerator;
