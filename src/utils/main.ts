import { TreeItemCollapsibleState, Uri, window } from "vscode";
import * as vscode from "vscode";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { readdir, readFile } from "fs/promises";
import { basename, extname, join } from "path";
import { promisify } from "util";
import { exec } from "child_process";
import minimist from "minimist";
import {
  BlogsTreeDataProvider,
  TreeItem,
} from "../views/blogsTreeDataProvider";
import axios from "axios";
import * as net from "net";
import { SimpleGit } from "simple-git";
import {
  DEFAULT_EMAIL,
  DEFAULT_USERNAME,
  EXT_HOME_DIRNAME,
} from "../services/config";
import { load, dump } from "js-yaml";
import {
  checkRepoExists,
  deleteRemoteRepo,
  getUserOctokitInstance,
  localAccessToken,
} from "../services/githubService";
import { logMessage } from "./logger";

/**
 * Checks if two paths are equal.
 * @param path1 - The first path.
 * @param path2 - The second path.
 * @returns Whether they are equal.
 */
export const arePathsEqual = (path1: string, path2: string): boolean => {
  return Uri.file(path1).fsPath === Uri.file(path2).fsPath;
};

/**
 * Handles errors by displaying an error message in the VS Code window.
 * @param error - The error object containing the error details, which can be of type Error or unknown.
 * @param message - A custom message to display along with the error. Defaults to "An error occurred".
 */
export const handleError = (
  error: unknown,
  message: string = "An error occurred"
) => {
  let errorMessage: string;

  if (error instanceof Error) {
    errorMessage = `${message}: ${error.message}`;
  } else {
    errorMessage = `${message}: An unknown error occurred`;
  }

  logMessage(errorMessage, true, "error");
};

// Promisify exec for easier async/await usage
export const execAsync = promisify(exec);

// Uninstall NPM modules
export const uninstallNpmModule = async (dirPath: string, name: string) => {
  try {
    await execAsync(`npm uninstall ${name}`, { cwd: dirPath });
    logMessage(`"${name}" uninstalled successfully.`, true);
  } catch (error) {
    handleError(error, `Error uninstalling "${name}"`);
  }
};

export const isModuleExisted = (
  workspaceRoot: string,
  moduleName: string,
  modulesDirname: string = "node_modules"
) => {
  const moduleDir = join(workspaceRoot, modulesDirname, moduleName);
  return existsSync(moduleDir);
};

// Install NPM modules
export const installNpmModule = async (dirPath: string, name: string) => {
  try {
    logMessage(`Installing "${name}" module.`, true);
    await execAsync(`npm install ${name}`, { cwd: dirPath });
    logMessage(`"${name}" installed successfully.`, true);
    return true;
  } catch (error) {
    handleError(error, `Error installing "${name}"`);
    return false;
  }
};

// Install NPM modules
export const installNpmModules = async (dirPath: string) => {
  try {
    logMessage("Installing NPM modules...", true);
    await execAsync("npm install", { cwd: dirPath });
    logMessage("NPM modules installed successfully.", true);
    return true;
  } catch (error) {
    handleError(error, "Error installing NPM modules");
    return false;
  }
};

/**
 * Copies a specified npm package from node_modules to a target directory.
 * @param dirPath - The root directory containing node_modules.
 * @param packageName - The name of the npm package to copy.
 * @param targetDir - The directory to copy the package into.
 */
export const copyNpmPackageToDir = (
  dirPath: string,
  packageName: string,
  targetDir: string
) => {
  const src = join(dirPath, "node_modules", packageName);
  const dest = join(targetDir, packageName);

  if (!existsSync(src)) {
    logMessage(
      `Package "${packageName}" does not exist in node_modules.`,
      true,
      "error"
    );
    return;
  }
  if (existsSync(dest)) {
    logMessage(
      `"${packageName}" already exists in "${targetDir}", skipping copy.`,
      false
    );
    return;
  }
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  copyFiles(src, dest);
  logMessage(`Copied "${packageName}" to "${targetDir}".`, true);
};

/**
 * Installs missing dependencies from the specified directory's package.json.
 * @param dirPath - The directory path containing the package.json file.
 */
export const installMissingDependencies = async (dirPath: string) => {
  const packageJsonPath = join(dirPath, "package.json");

  // Check if package.json exists
  if (!existsSync(packageJsonPath)) {
    vscode.window.showWarningMessage(
      "package.json not found in the specified directory."
    );
    return;
  }

  // Read and parse package.json
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));

  const { dependencies = {}, devDependencies = {} } = packageJson;

  // Combine dependencies and devDependencies into a single array
  const allDependencies = { ...dependencies, ...devDependencies };

  // Check each dependency and install if missing
  for (const packageName of Object.keys(allDependencies)) {
    const installed = isModuleExisted(dirPath, packageName);
    if (installed) {
      continue;
    }
    await installNpmModule(dirPath, packageName); // Install the missing package
  }
};

/**
 * Installs specified modules in the given directory if they are not already installed.
 * @param dirPath - The directory path where the modules will be installed.
 * @param modules - An array of module names to install.
 */
export const installModules = async (dirPath: string, modules: string[]) => {
  // Ensure the directory exists
  if (!existsSync(dirPath)) {
    logMessage(`Directory "${dirPath}" does not exist.`, true, "error");
    return;
  }

  // Check each module and install if missing
  for (const moduleName of modules) {
    const installed = await isModuleExisted(dirPath, moduleName);
    if (installed) {
      continue;
    }
    await installNpmModule(dirPath, moduleName); // Install the missing module
  }
};

/**
 * Checks if a path is valid
 * @param path - The path to check
 * @returns Returns true if the path is valid, otherwise false
 */
export const isValidPath = (path: string | undefined): boolean => {
  // Regular expression to match invalid characters
  const invalidChars: RegExp = /[<>:"'|?*]/;

  // Check if the path is empty or contains invalid characters
  if (!path || invalidChars.test(path)) {
    return false;
  }

  // Further validity checks (can be extended as needed)
  if (path.length > 255) {
    return false; // Assuming the path length cannot exceed 255 characters
  }

  return true; // Path is valid
};

/**
 * Checks if a file name is valid.
 * @param fileName - The file name to check.
 * @returns Returns true if the file name is valid, otherwise false.
 */
export const isValidFileName = (fileName: string | undefined): boolean => {
  // Regular expression to match invalid characters
  const invalidChars: RegExp = /[<>:"'|?*\\/]/;

  // Check if the file name is empty or contains invalid characters
  if (!fileName || invalidChars.test(fileName)) {
    return false;
  }

  // Further validity checks (can be extended as needed)
  if (fileName.length === 0 || fileName.length > 255) {
    return false; // Assuming the file name cannot be empty or exceed 255 characters
  }

  return true; // File name is valid
};

/**
 * Formats the address to create a full URL.
 *
 * @param {string} ip - The IP address of the server.
 * @param {number} port - The port number of the server.
 * @returns {string} - The formatted URL as a string.
 */
export const formatAddress = (ip: string, port: number, root: string = "/") => {
  // Use 'localhost' for '0.0.0.0' or '::'
  const hostname = ip === "0.0.0.0" || ip === "::" ? "localhost" : ip;

  // Construct and return the full URL
  return new URL(`http://${hostname}:${port}${root}`).toString();
};

/**
 * Parses command line arguments from a command string.
 *
 * @param {string} cmd - The command string containing arguments.
 * @returns {object} - An object containing the parsed arguments.
 */
export const getArgs = (cmd: string) => {
  // Match arguments including quoted strings
  const argv = cmd
    .match(/(?:[^\s"]+|"[^"]*")+/g)!!
    .map((arg) => arg.replace(/"/g, ""));

  // Parse the arguments using minimist
  const args = minimist(argv, { string: ["_", "p", "path", "s", "slug"] });

  return args;
};

/**
 * Type for the exclusion patterns.
 */
export type ExcludePattern = string | RegExp;

/**
 * Recursively copies files from the source directory to the target directory.
 *
 * @param {string} src - The source directory path.
 * @param {string} dest - The destination directory path.
 * @param {ExcludePattern[]} exclude - An array of patterns to exclude (string or RegExp).
 */
export const copyFiles = (
  src: string,
  dest: string,
  exclude: ExcludePattern[] = []
) => {
  // Ensure the source path exists
  if (!existsSync(src)) {
    throw new Error(`Source directory "${src}" does not exist.`);
  }

  // Create the destination directory if it doesn't exist
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  // Read the contents of the source directory
  const items = readdirSync(src);

  items.forEach((item) => {
    const srcItem = join(src, item);
    const destItem = join(dest, item);

    // Check if the item matches any of the exclude patterns
    const isExcluded = exclude.some((pattern) => {
      if (typeof pattern === "string") {
        return item === pattern || item.startsWith(pattern.replace(/\*/g, "")); // Simple wildcard support
      } else if (pattern instanceof RegExp) {
        return pattern.test(item);
      }
      return false;
    });

    if (isExcluded) {
      return; // Skip excluded items
    }

    // Check if the item is a directory
    if (statSync(srcItem).isDirectory()) {
      copyFiles(srcItem, destItem);
    } else {
      // Copy the file
      copyFileSync(srcItem, destItem);
    }
  });
};

/**
 * Reveals an item in the Blogs TreeView based on the provided URI.
 *
 * @param {vscode.Uri} uri - The URI of the item to reveal.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export const revealItem = async (
  uri: vscode.Uri,
  context: vscode.ExtensionContext
) => {
  const prevUri = context.globalState.get<vscode.Uri>("prevUri");

  if (uri.fsPath === prevUri?.fsPath) {
    return;
  }

  context.globalState.update("prevUri", uri);

  const blogsTreeView: vscode.TreeView<vscode.TreeItem> =
    context.subscriptions.find(
      (subscription) =>
        typeof subscription === "object" &&
        (subscription as any).title === "Blogs"
    ) as vscode.TreeView<vscode.TreeItem>;

  const blogsProvider: BlogsTreeDataProvider | undefined =
    context.subscriptions.find(
      (subscription) => subscription instanceof BlogsTreeDataProvider
    );

  if (blogsProvider && blogsTreeView) {
    const item = await blogsProvider.findNodeByUri(uri);
    if (item) {
      blogsTreeView.reveal(item, {
        expand: true,
        focus: true,
      });
    }
  }
};

export const deleteItem = async (
  args: any,
  context: vscode.ExtensionContext
) => {
  let { siteDir, label, contextValue, siteName, userName, uri } = args;

  let path = uri.fsPath;

  let prompt: string = "";

  switch (contextValue) {
    case "site":
      prompt = `Are you sure you want to delete site "${label}"`;
      break;

    case "theme":
      prompt = `Are you sure you want to delete theme "${label}" and its config`;
      break;

    case "scaffold":
      prompt = `Are you sure you want to delete scaffold "${label}"`;
      break;

    case "page":
      path = path.replace(/[\\/]+index.md$/i, "");
      prompt = `Are you sure you want to delete page "${label}"`;
      break;

    case "draft":
      prompt = `Are you sure you want to delete draft "${label}"`;
      break;

    case "post":
      prompt = `Are you sure you want to delete post "${label}"`;
      break;

    case "folder":
      prompt = `Are you sure you want to delete the directory "${label}" and all its files?`;
      break;

    default:
      prompt = `Are you sure you want to delete "${label}"`;
      break;
  }

  // Ask for user confirmation
  const confirm = await vscode.window.showWarningMessage(
    prompt,
    { modal: true },
    "Delete"
  );

  if (confirm !== "Delete") return false;

  try {
    // Delete the item (file or directory)
    rmSync(path, { recursive: true, force: true });
    logMessage(`Deleted "${path}" successfully.`, true);
  } catch (error) {
    handleError(error, "Error deleting item");
  }

  if (contextValue === "site") {
    const octokit = await getUserOctokitInstance(localAccessToken);
    const repoExists = await checkRepoExists(octokit, siteName);
    if (repoExists) {
      const repoConfirm = await window.showWarningMessage(
        `Keep "${label}" github page?`,
        { modal: true },
        "Keep",
        "Delete"
      );
      if (repoConfirm === "Delete") {
        try {
          await deleteRemoteRepo(octokit, userName, siteName);
        } catch (error) {
          handleError(error, `Error deleting "${label}" github repo.`);
        }
      }
    }
  }

  if (
    contextValue === "theme" &&
    isModuleExisted(siteDir, `hexo-theme-${label}`)
  ) {
    try {
      await execAsync(`npm uninstall hexo-theme-${label}`, { cwd: siteDir });
      logMessage(
        `"hexo-theme-${label}" npm module uninstalled successfully.`,
        true
      );
    } catch (error) {
      handleError(
        error,
        `Error uninstalling "hexo-theme-${label}" npm module.`
      );
    }

    const themeConfigPath = join(siteDir, `_config.${label}.yml`);

    if (existsSync(themeConfigPath)) {
      const configConfirm = await window.showWarningMessage(
        `Keep "${label}" Theme config?`,
        { modal: true },
        "Keep",
        "Delete"
      );
      if (configConfirm === "Delete") {
        try {
          rmSync(themeConfigPath, { recursive: true, force: true });
          logMessage(`Successfully deleted "${label}" Theme config.`, true);
        } catch (error) {
          handleError(error, `Error deleting "${label}" Theme config.`);
        }
      }
    }
  }

  refreshBlogsProvider(context);
};

/**
 * Creates a new directory.
 * @param path - The path of the directory to create.
 */
export const createDirectory = (path: string) => {
  mkdirSync(path, { recursive: true });
  logMessage(`Subdirectory ${basename(path)} created.`, true);
};

/**
 * Opens an existing file.
 * @param path - The path of the file to open.
 */
export const openFile = async (path: string) => {
  const document = await vscode.workspace.openTextDocument(path);
  await vscode.window.showTextDocument(document);
  logMessage(`File ${basename(path)} opened for editing.`, true);
};

/**
 * Prompts the user for a name.
 * @param placeholder - The placeholder text for the input box.
 * @returns Returns the name if valid, otherwise undefined.
 */
export const promptForName = async (
  placeHolder: string,
  args?: vscode.InputBoxOptions
): Promise<string | undefined> => {
  const name = await vscode.window.showInputBox({ placeHolder, ...args });
  if (!name) {
    return name;
  }
  if (!isValidFileName(name)) {
    logMessage("Invalid name. Please try again.", true, "error");
    return undefined; // Return undefined to indicate an invalid name
  }
  return name;
};

/**
 * Executes a user command after prompting for input.
 * @param placeholder - The placeholder text for the input box.
 * @param action - A function that takes the command string and returns a Promise.
 */
export const executeUserCommand = async (
  placeholder: string,
  action: (cmd: string) => Promise<void>
) => {
  // Show an input box to prompt the user for a command
  const userInput = await vscode.window.showInputBox({
    placeHolder: placeholder,
  });

  if (userInput) {
    // Remove the "hexo" prefix from the input command and trim whitespace
    const cmd = userInput.replace(/^\s*hexo\s*/i, "").trim();
    try {
      // Execute the action with the cleaned command
      await action(cmd);
    } catch (error) {
      // Handle any errors that occur during command execution
      handleError(error, "Failed to execute command");
    }
  } else {
    // Warn the user if no command was entered
    logMessage("No command entered!", true, "error");
  }
};

/**
 * Executes an asynchronous action with feedback messages.
 * @param action - A function that returns a Promise representing the action to execute.
 * @param successMessage - The message to display upon successful execution.
 * @param errorMessage - The message to display if an error occurs.
 */
export const executeWithFeedback = async (
  action: () => Promise<void>,
  successMessage: string,
  errorMessage: string
) => {
  try {
    await action(); // Execute the provided action
    logMessage(successMessage, true); // Show success message
  } catch (error) {
    handleError(error, errorMessage); // Handle errors and show error message
  }
};

/**
 * Searches for npm packages matching the given text and filters them with a regex if provided.
 * @param text - The text to search for in package names.
 * @param regex - An optional regex to further filter the results.
 * @returns A promise that resolves to an array of matching package names.
 */
export const searchNpmPackages = async (
  text: string,
  regex?: RegExp
): Promise<string[]> => {
  let allPackages: any[] = [];
  let from = 0;
  const size = 250;
  const maxPackages = 1000; // ✅ 修改为最多抓取 1000 个

  try {
    while (allPackages.length < maxPackages) {
      const response = await axios.get("https://api.npms.io/v2/search", {
        params: {
          q: text,
          size,
          from,
        },
      });

      const results = response.data.results;
      if (!results || results.length === 0) {
        break;
      }

      allPackages = allPackages.concat(results);

      if (results.length < size) {
        break;
      } // 最后一页
      from += size;
    }

    // 用正则筛选包名
    let matchedPackages = allPackages;
    if (regex) {
      matchedPackages = matchedPackages.filter((pkg) =>
        regex.test(pkg.package.name)
      );
    }

    // 限制返回前 1000 个结果
    return matchedPackages.slice(0, maxPackages).map((pkg) => pkg.package.name); // Return only the package names
  } catch (error) {
    logMessage(`Error fetching npm packages: ${error}`, false, "error");
    throw error; // Re-throw error for handling in the calling function
  }
};

/**
 * Retrieves all themes from the specified themes directory.
 * @param workspaceRoot - The root path of the workspace.
 * @param themeDir - The name of the themes directory (default is "themes").
 * @returns A promise that resolves to an array of TreeItem representing the themes.
 */
export const getThemesInThemesDir = async (
  userName: string,
  siteName: string,
  workspaceRoot: string,
  parent: TreeItem,
  themeDir: string = "themes",
  regex: RegExp = /^hexo-theme-[^-]+$/i
): Promise<TreeItem[]> => {
  const themesDir = join(workspaceRoot, themeDir);

  // Return an empty array if the themes directory does not exist
  if (!existsSync(themesDir)) {
    return [];
  }

  // Read the themes directory, filter by regex, and create TreeItem for each subdirectory
  const themes = readdirSync(themesDir)
    .filter((name) => {
      // Only keep directories that match the regex
      return statSync(join(themesDir, name)).isDirectory() && regex.test(name);
    })
    .map((name) => {
      // Remove "hexo-theme-" prefix if present
      const displayName = name.replace(/^hexo-theme-/, "");
      const fullPath = join(themesDir, name); // Full path to the item
      const uri = Uri.file(fullPath); // Create a URI for the item

      // 如果目标配置文件已存在则跳过复制
      const configPath = join(uri.fsPath, "_config.yml");
      const destPath = join(workspaceRoot, `_config.${displayName}.yml`);
      if (!existsSync(destPath) && existsSync(configPath)) {
        copyFileSync(configPath, destPath);
        vscode.window.showInformationMessage(
          `Copied _config.yml of theme "${displayName}" to root as _config.${displayName}.yml`
        );
      }

      const item = new TreeItem(
        userName,
        siteName,
        displayName,
        TreeItemCollapsibleState.Collapsed,
        parent,
        uri
      );
      item.resourceUri = uri;
      item.contextValue = "theme";
      return item;
    });

  return themes; // Return the array of TreeItem representing themes
};
/**
 * Reads all themes listed in the package.json file and returns their package names.
 * @param workspaceRoot - The root path of the workspace.
 * @param regex - A regular expression to filter theme names (default matches "hexo-theme-*").
 * @returns An array of theme package names found in package.json.
 */
export const getThemePackageNamesInPackageJson = (
  workspaceRoot: string,
  regex: RegExp = /^hexo-theme-[^-]+$/i
): string[] => {
  const packageJsonPath = join(workspaceRoot, "package.json");

  // Return an empty array if the package.json file does not exist
  if (!existsSync(packageJsonPath)) {
    return [];
  }

  // Read and parse the package.json file
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  // Filter dependencies and devDependencies based on the regex and existence
  const themes = Object.keys(packageJson.dependencies ?? {}).filter(
    (v: string) => regex.test(v) && isModuleExisted(workspaceRoot, v)
  );
  const devThemes = Object.keys(packageJson.devDependencies ?? {}).filter(
    (v: string) => regex.test(v) && isModuleExisted(workspaceRoot, v)
  );

  return [...new Set([...themes, ...devThemes])]; // Return unique theme package names
};

/**
 * Generates a random available port.
 * @returns A promise that resolves to a random available port number.
 */
export const getRandomAvailablePort = async (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    // Attempt to listen on a random port
    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port)); // Resolve with the available port
    });

    // Handle errors (e.g., if the port is occupied)
    server.on("error", () => {
      server.close();
      reject(new Error("Could not find an available port."));
    });
  });
};

/**
 * Refreshes the BlogsTreeDataProvider if it exists.
 * @param context - The extension context.
 */
export const refreshBlogsProvider = (context: vscode.ExtensionContext) => {
  const blogsProvider: BlogsTreeDataProvider | undefined =
    context.subscriptions.find(
      (subscription) => subscription instanceof BlogsTreeDataProvider
    );

  if (blogsProvider) {
    blogsProvider.refresh(); // Call refresh if the provider exists
  } else {
    logMessage("BlogsTreeDataProvider not found.", true, "error");
  }
};

/**
 * Initializes the source directory by creating default folders for the provided items.
 * @param sourceDir - The source directory where the folders will be created.
 * @param items - An array of item names for which folders will be created.
 */
export const initSourceItem = (sourceDir: string, items: string[]) => {
  // Ensure the source directory exists
  if (!existsSync(sourceDir)) {
    vscode.window.showErrorMessage(
      `Source directory "${sourceDir}" does not exist.`
    );
    return;
  }

  // Create folders for each item if they do not already exist
  for (const item of items) {
    const itemDir = join(sourceDir, item);
    if (!existsSync(itemDir)) {
      mkdirSync(itemDir);
      logMessage(`Created folder: "${item}"`, true);
    }
  }
};

/**
 * Recursively replaces the last occurrence of specific patterns in HTML anchor tags in files of a specified type within a given directory.
 * @param dirPath - The directory path to search in.
 * @param fileType - The file extension to filter files (e.g., '.html').
 * @param regex - The regular expression used to find matches.
 * @param replacement - The replacement string, which can use $1, $2, etc. for matched groups.
 */
export const replaceLastInHtmlLinks = (
  dirPath: string,
  fileType: string,
  regex: RegExp,
  replacement: string
) => {
  // Check if the directory exists
  if (!existsSync(dirPath)) {
    logMessage(`Directory "${dirPath}" does not exist.`);
    return;
  }

  // Read all items in the directory
  const items = readdirSync(dirPath);

  // Loop through each item
  for (const item of items) {
    const itemPath = join(dirPath, item);
    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      // If the item is a directory, recurse into it
      replaceLastInHtmlLinks(itemPath, fileType, regex, replacement);
    } else if (extname(item) === fileType) {
      // If the item is a file of the specified type, read and replace content
      const content = readFileSync(itemPath, "utf-8");

      // Find the last match of the regex
      const matches = [...content.matchAll(regex)];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const lastMatchIndex = lastMatch.index!;

        // Replace only the last occurrence
        const newContent =
          content.slice(0, lastMatchIndex) +
          content.slice(lastMatchIndex).replace(regex, replacement);

        // Only write back if there are changes
        if (content !== newContent) {
          writeFileSync(itemPath, newContent, "utf-8");
          logMessage(`Updated Copyright: ${itemPath}`);
        }
      }
    }
  }
};

/**
 * Sets the username and email for the current Git repository.
 * @param git - The simpleGit instance.
 * @param username - The username to set. Defaults to DEFAULT_USERNAME.
 * @param email - The email to set. Defaults to DEFAULT_EMAIL.
 */
export const setGitUser = async (
  git: SimpleGit,
  username: string = DEFAULT_USERNAME,
  email: string = DEFAULT_EMAIL
) => {
  try {
    await git.addConfig("user.name", username);
    await git.addConfig("user.email", email);
    logMessage(`Git user set: ${username} <${email}>`);
  } catch (error) {
    logMessage(
      `Error setting Git user: ${(error as Error).message}`,
      false,
      "error"
    );
  }
};

/**
 * Clears the specified directory, excluding certain files and folders.
 * @param dir - The path of the directory to clear.
 * @param exclude - An array of files and folders to exclude from deletion.
 */
export const clearDirectory = (dir: string, exclude: string[] = []) => {
  // Check if the directory exists
  if (!existsSync(dir)) {
    logMessage(`Directory does not exist: ${dir}`, false, "error");
    return;
  }

  // Read all files and folders in the directory
  const items = readdirSync(dir);

  items.forEach((item) => {
    const itemPath = join(dir, item);

    // Check if the current item is in the exclude list
    if (!exclude.includes(item)) {
      // Remove file or folder
      rmSync(itemPath, { recursive: true, force: true });
      logMessage(`Deleted: ${itemPath}`);
    } else {
      logMessage(`Skipped: ${itemPath}`);
    }
  });
};

/**
 * Modifies a specific field in a YAML file.
 * @param filePath - The path to the YAML file.
 * @param fieldPath - The dot-separated path to the field to modify (e.g., 'parent.child').
 * @param newValue - The new value to set for the field.
 * @throws Will throw an error if the file cannot be read or written.
 */
export const modifyYamlField = (
  filePath: string,
  fieldPath: string,
  newValue: any
) => {
  try {
    const fileContents = readFileSync(filePath, "utf8");
    const data = load(fileContents) as Record<string, any>;

    const fields = fieldPath.split(".");
    let current = data;

    for (let i = 0; i < fields.length - 1; i++) {
      if (!(fields[i] in current)) {
        throw new Error(`Field path does not exist: ${fieldPath}`);
      }
      current = current[fields[i]];
    }

    current[fields[fields.length - 1]] = newValue;

    const updatedYaml = dump(data);
    writeFileSync(filePath, updatedYaml, "utf8");
    logMessage(`Successfully updated ${fieldPath} to ${newValue}`);
  } catch (error) {
    handleError(error, "Error modifying YAML file");
  }
};

/**
 * Extracts siteDir and siteName from a given path.
 * @param path - The path to search for a site directory and name.
 * @returns An object with siteDir and siteName if found, otherwise undefined.
 */
export const extractSiteInfo = (
  path: string
): { siteDir: string; siteName: string } | undefined => {
  // Matches: .../<EXT_HOME_DIRNAME>/<user>/<siteName>/...
  const pattern = new RegExp(`(.*/${EXT_HOME_DIRNAME}/[^/]+/([^/]+))`);
  const match = path.match(pattern);
  if (match && match[1] && match[2]) {
    return { siteDir: match[1], siteName: match[2] };
  }
  return undefined;
};
