// Test script to show repository structure comparison
async function testRepositoryStructure() {
  console.log('=== TESTING REPOSITORY STRUCTURE ===\n');
  
  // Fetch the repository structure directly
  try {
    const response = await fetch('https://api.github.com/repos/Hemlock5712/2025-Workshop/contents');
    const rootContents = await response.json();
    
    console.log('ROOT LEVEL FILES AND FOLDERS:');
    rootContents.forEach(item => {
      console.log(`${item.type === 'dir' ? '📁' : '📄'} ${item.name}`);
    });
    
    console.log('\n=== DETAILED STRUCTURE ===');
    
    // Recursively fetch structure
    async function fetchDirectory(path = '', indent = '') {
      const url = path ? `https://api.github.com/repos/Hemlock5712/2025-Workshop/contents/${path}` : 'https://api.github.com/repos/Hemlock5712/2025-Workshop/contents';
      
      try {
        const response = await fetch(url);
        const contents = await response.json();
        
        if (Array.isArray(contents)) {
          for (const item of contents) {
            if (item.name === '.vscode' || item.name === '.git') continue;
            
            console.log(`${indent}${item.type === 'dir' ? '📁' : '📄'} ${item.path}`);
            
            if (item.type === 'dir' && indent.length < 12) { // Limit depth
              await fetchDirectory(item.path, indent + '  ');
            }
          }
        }
      } catch (error) {
        console.log(`${indent}❌ Error fetching ${path}: ${error.message}`);
      }
    }
    
    await fetchDirectory();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testRepositoryStructure();
