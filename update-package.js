const fs = require('fs');
const path = require('path');

const dirPath = './'; // Adjust the directory path if needed

// Function to update package.json
function updatePackageJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const packageJson = JSON.parse(data);

  let updated = false;

  // Check and update the current package version if it starts with @balerion/
  if (packageJson.name && packageJson.name.startsWith('@balerion/')) {
    const currentVersion = packageJson.version;
    if (!currentVersion.startsWith('workspace')) {
      packageJson.version = '0.0.0';
      updated = true;
    }
  }

  // Update dependencies
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (packageJson[depType]) {
      Object.keys(packageJson[depType]).forEach((pkg) => {
        if (pkg.startsWith('@balerion/')) {
          const version = packageJson[depType][pkg];

          // Only update if version does not start with "workspace"
          if (!version.startsWith('workspace')) {
            packageJson[depType][pkg] = '0.0.0';
            updated = true;
          }
        }
      });
    }
  });

  // If updated, write the changes back to the file
  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Function to traverse directory and find all package.json files
function findAndUpdatePackageJsons(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      findAndUpdatePackageJsons(filePath);
    } else if (file === 'package.json') {
      updatePackageJson(filePath);
    }
  });
}

// Start the process
findAndUpdatePackageJsons(dirPath);
