const fs = require("fs");
const path = require("path");

const glob = require("glob");

//extract workspaces from package.json
const packageJsonPath = path.join(__dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const workspaces = packageJson.workspaces;

//Get all the directories that matches the workspaces' patterns
let directories = [];
workspaces.forEach((pattern) => {
  const folders = glob.sync(pattern);
  directories = directories.concat(folders);
});

//File pattern for getting the env schema (e.g. .env.example or .env.schema)
const envPattern = ".env.*";

directories.forEach((dirPath) => {
  const filePath = path.join(dirPath, ".env");

  //If .env doesn't already exist, make env
  if (!fs.existsSync(filePath)) {
    const files = glob.sync(path.join(dirPath, envPattern));

    if (files.length > 0) {
      const fileContent = fs.readFileSync(files[0], "utf8");
      fs.writeFileSync(filePath, fileContent);
      console.log(`.env created in ${dirPath}`);
    }
  }
});
