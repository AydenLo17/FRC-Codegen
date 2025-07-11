import { useState } from 'react'
import './App.css'
import ProjectGenerator from './components/ProjectGenerator'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>FRC Robot Code Generator</h1>
        <p>Generate customized FRC robot code for your team</p>
        
        <div className="features">
          <h2>🚀 Features</h2>
          <ul>
            <li>🤖 Latest FRC 2025 swerve drive code</li>
            <li>⚙️ Automatic team number and name customization</li>
            <li>📦 Ready-to-use ZIP file download</li>
            <li>🔄 Always up-to-date with source repository</li>
            <li>🏁 Phoenix 6 swerve drivetrain implementation</li>
          </ul>
        </div>
        
        <ProjectGenerator />
        
        <div className="footer">
          <p>
            Source code from{' '}
            <a 
              href="https://github.com/Hemlock5712/2025-Workshop" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Hemlock5712/2025-Workshop
            </a>
          </p>
        </div>
      </header>
    </div>
  )
}

export default App
