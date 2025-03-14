const fs = require('fs');
const path = require('path');

function renameFilesInDirectory(dir) {
  // Skip the node_modules folder
  if (dir.includes('node_modules')) return;

  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${dir}`, err);
      return;
    }

    files.forEach(file => {
      const oldPath = path.join(dir, file.name);
      const newName = file.name.includes('Strapi') ? file.name.replace('Strapi', 'Balerion') : file.name;
      const newPath = path.join(dir, newName);

      if (file.isDirectory()) {
        renameFilesInDirectory(oldPath); // Recursively rename files in subdirectories
      }

      if (file.isFile() || file.isDirectory()) {
        // Rename file or directory
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error(`Error renaming ${oldPath} to ${newPath}`, err);
          } else {
            console.log(`Renamed: ${oldPath} → ${newPath}`);
          }
        });
      }
    });
  });
}

// Starting directory (change this to the folder you want to start from)
const startDir = './'; // Current directory
renameFilesInDirectory(startDir);
