const fs = require("fs");
const path = require("path");

// Define the directory to search in
const searchDir = path.join(__dirname, "app");

// Function to recursively find all .js and .jsx files
function findFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath));
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      results.push(filePath);
    }
  }

  return results;
}

// Function to fix imports in a file
function fixImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let newContent = content;

  // Calculate relative path to the root config.js
  const relativePath = path
    .relative(path.dirname(filePath), __dirname)
    .replace(/\\/g, "/");

  // Fix the import statement for both ../config and ../../config patterns
  newContent = newContent.replace(
    /from ['"]\.\.\/config['"]/g,
    `from '${relativePath}/config'`
  );
  newContent = newContent.replace(
    /from ['"]\.\.\/\.\.\/config['"]/g,
    `from '${relativePath}/config'`
  );

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed imports in ${filePath}`);
  }
}

// Find and fix all files
const files = findFiles(searchDir);
files.forEach(fixImports);

console.log("Import paths have been fixed!");
