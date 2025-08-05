import { Uri, ExtensionContext, window, workspace, commands } from "vscode";
import {
  getHexoConfig,
  getPreviewRoute,
  handleCreateFile,
  hexoExec,
} from "../services/hexoService";
import {
  createDirectory,
  executeUserCommand,
  extractSiteInfo,
  formatAddress,
  getRandomAvailablePort,
  handleError,
  installNpmModule,
  isValidPath,
  openFile,
  promptForName,
  refreshBlogsProvider,
  searchNpmPackages,
} from "../utils/main";
import {
  checkRepoExists,
  deleteRemoteRepo,
  getUserOctokitInstance,
  initializeSite,
  localAccessToken,
  localUsername,
  pushHexo,
  pushToGitHubPages,
} from "../services/githubService";
import type { Server } from "http";
import {
  DRAFTS_DIRNAME,
  POSTS_DIRNAME,
  EXT_HOME_DIR,
  THEMES_DIRNAME,
} from "../services/config";
import { basename, join, extname, dirname } from "path";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import {
  BlogsTreeDataProvider,
  TreeItem,
} from "../views/blogsTreeDataProvider";
import * as fm from "hexo-front-matter";
import { logMessage } from "../utils/logger";
import { openHexoPreview, previewPanel } from "../webview/markdownPreview";

interface ServerInfo {
  server: Server;
  address: string;
}

export const serverMap: Map<string, ServerInfo> = new Map();
export const serverStatusMap: Map<string, boolean> = new Map();

/**
 * Execute a custom Hexo command.
 */
export const executeHexoCommand = async (
  element: TreeItem,
  _context: ExtensionContext
) => {
  const { siteDir } = element;
  await executeUserCommand(
    "Please enter a command without hexo, e.g., new --path test/test",
    (cmd) => hexoExec(siteDir, cmd)
  );
};

/**
 * Add a new item (page, draft, blog, or sub route).
 */
export const addItem = async (element: TreeItem, context: ExtensionContext) => {
  try {
    const { siteDir, resourceUri, label } = element;
    const config = await getHexoConfig(siteDir);

    // Root directory
    if (!resourceUri) {
      if (label === BlogsTreeDataProvider.getLabel()) {
        await createPage(siteDir, context);
      } else if (label === BlogsTreeDataProvider.getLabel(DRAFTS_DIRNAME)) {
        await createDraft(siteDir, context);
      } else if (label === BlogsTreeDataProvider.getLabel(POSTS_DIRNAME)) {
        await handleBlogOrSubRoute(siteDir, config, context);
      }
    } else {
      await handleBlogOrSubRoute(
        siteDir,
        config,
        context,
        element.resourceUri?.fsPath
      );
    }
  } catch (error) {
    handleError(error, "Failed to create item");
  }
};

async function createPage(siteDir: string, context: ExtensionContext) {
  const name = await promptForName("Please enter the page name");
  if (name) {
    await handleCreateFile(siteDir, name, "Page", context);
  }
}

async function createDraft(siteDir: string, context: ExtensionContext) {
  const name = await promptForName("Please enter the draft name");
  if (name) {
    await handleCreateFile(siteDir, name, "Draft", context);
  }
}

async function handleBlogOrSubRoute(
  siteDir: string,
  config: any,
  context: ExtensionContext,
  parentPath?: string
) {
  const options = ["Blog", "Sub Route"];
  const selection = await window.showQuickPick(options, {
    placeHolder: "Choose an option",
  });
  if (!selection) return;

  if (selection === "Sub Route") {
    const name = await promptForName("Please enter the sub route name");
    if (!name) return;
    const dirPath = parentPath
      ? join(parentPath, name)
      : join(siteDir, config.source_dir, POSTS_DIRNAME, name);
    createDirectory(dirPath);
  } else {
    const name = await promptForName("Please enter the blog name");
    if (!name) return;
    await handleCreateFile(siteDir, name, "Blog", context, parentPath);
  }
}

/**
 * Update server status.
 */
const setServerStatus = (siteName: string, status: boolean): void => {
  serverStatusMap.set(siteName, status);
};

/**
 * Start Hexo server.
 */
export const startHexoServer = async (
  element: TreeItem,
  _context: ExtensionContext
) => {
  const { siteName, siteDir } = element;
  logMessage("Starting server...", true);
  try {
    const port = await getRandomAvailablePort();
    const { root } = await getHexoConfig(siteDir);
    const server = await hexoExec(
      siteDir,
      `server --draft --debug --port ${port}`
    );
    const { address } = server.address() as any;
    const url = new URL(formatAddress(address, port, root));

    serverMap.set(siteName, { server, address: url.toString() });
    setServerStatus(siteName, true);

    if (previewPanel) {
      openHexoPreview({ host: url.host });
    }
    logMessage(`Successfully started server: ${url}`, true);
  } catch (error) {
    handleError(error, "Failed to start Hexo server");
  }
};

/**
 * Stop Hexo server.
 */
export const stopHexoServer = async (
  element: TreeItem,
  _context: ExtensionContext
) => {
  try {
    const { siteName } = element;
    const { server } = serverMap.get(siteName)!;
    server.close();
    setServerStatus(siteName, false);
    logMessage("Successfully stopped server", true);
  } catch (error) {
    handleError(error, "Failed to stop Hexo server");
  }
};

/**
 * Publish a draft post.
 */
export const publishDraft = async (
  element: TreeItem,
  _context: ExtensionContext
) => {
  const { siteDir, resourceUri } = element;
  const name = basename(resourceUri!.fsPath, ".md");
  try {
    await hexoExec(siteDir, `publish ${name} --debug`);
    const config = await getHexoConfig(siteDir);
    const postPath = join(
      siteDir,
      config.source_dir,
      POSTS_DIRNAME,
      `${name}.md`
    );
    await openFile(postPath);
    logMessage(`Successfully published ${name}`, true);
  } catch (error) {
    handleError(error, `Failed to publish ${name}`);
  }
};

/**
 * Deploy blog to GitHub Pages.
 */
export const deployBlog = async (
  element: TreeItem,
  _context: ExtensionContext
) => {
  logMessage("Deploying...", true);
  try {
    await pushToGitHubPages(element);
    logMessage("Successfully deployed blog to GitHub pages", true);
  } catch (error) {
    handleError(error, "Failed to deploy blog to GitHub pages");
  }
};

/**
 * Open local preview for a blog post.
 */
export const localPreview = async (
  element: TreeItem,
  context: ExtensionContext
) => {
  // Extract siteName, siteDir, and fsPath for preview
  let siteName: string, siteDir: string, fsPath: string;
  if (element.siteName && element.siteDir) {
    siteName = element.siteName;
    siteDir = element.siteDir;
    fsPath = element.resourceUri?.fsPath ?? (element as any).path;
  } else {
    const info = extractSiteInfo((element as any).path);
    siteName = info!.siteName;
    siteDir = info!.siteDir;
    fsPath = (element as any).path;
  }
  if (!fsPath) return;
  await commands.executeCommand("vscode.open", Uri.file(fsPath));

  try {
    if (!serverStatusMap.get(siteName)) {
      await startHexoServer({ siteName, siteDir } as TreeItem, context);
    }
    const { address } = serverMap.get(siteName)!;
    const route = await getPreviewRoute(siteDir, fsPath);
    openHexoPreview({ previewUrl: address + route });
  } catch (error) {
    handleError(error, "Failed to preview");
  }
};

/**
 * Apply a Hexo theme.
 */
export const applyTheme = async (
  element: TreeItem,
  context: ExtensionContext
) => {
  const { siteName, siteDir, label } = element;

  logMessage("Applying...", true);
  try {
    await hexoExec(siteDir, `config theme ${label} --debug`);
    await hexoExec(siteDir, "clean --debug");
    if (serverStatusMap.get(siteName)) {
      await stopHexoServer(element, context);
      await startHexoServer(element, context);
    }
    logMessage(`Successfully applied the theme "${label}".`, true);
  } catch (error) {
    handleError(error, "Failed to apply theme");
  }
};

/**
 * Apply a Hexo theme.
 */
export const setTheme = async (
  element: TreeItem,
  context: ExtensionContext
) => {
  const { siteDir, label } = element;
  const configPath = join(siteDir, `_config.${label}.yml`);
  if (existsSync(configPath)) {
    const doc = await workspace.openTextDocument(configPath);
    await window.showTextDocument(doc);
  } else {
    window.showWarningMessage(
      `Config file _config.${label}.yml not found in site directory.`
    );
  }
};

/**
 * Add a new Hexo theme.
 */
export const addTheme = async (
  element: TreeItem,
  context: ExtensionContext
) => {
  const { siteDir } = element;
  logMessage("Loading...", true);

  const options = await searchNpmPackages("hexo-theme-", /^hexo-theme-[^-]+$/);
  const selection = await window.showQuickPick(options, {
    placeHolder: "Choose an option",
  });
  if (!selection) return;

  logMessage("Installing...", true);
  try {
    await installNpmModule(siteDir, selection);
    refreshBlogsProvider(context);
  } catch (error) {
    handleError(error, "Failed to install theme");
  }
};

/**
 * Add a new Hexo site.
 */
export const addSite = async (
  _element: TreeItem,
  context: ExtensionContext
) => {
  try {
    const siteName = await promptForName("Please enter the site name");
    if (!siteName) return;

    const octokit = await getUserOctokitInstance(localAccessToken);
    const repoExists = await checkRepoExists(octokit, siteName);
    if (repoExists) throw Error(`Site "${siteName}" already exists on github.`);
    if (!localUsername) throw Error("Not logged in, Please log in first.");

    const siteDir = join(EXT_HOME_DIR, localUsername, siteName);
    await initializeSite(siteDir);
    refreshBlogsProvider(context);
    await pushToGitHubPages({
      userName: localUsername,
      siteDir,
      siteName,
    } as TreeItem);
    await pushHexo(context);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Add a new Hexo scaffold.
 */
export const addScaffold = async (
  element: TreeItem,
  context: ExtensionContext
) => {
  try {
    const { siteDir } = element;
    const scaffoldName = await promptForName("Please enter the scaffold name");
    if (!scaffoldName) return;

    await hexoExec(siteDir, `scaffold ${scaffoldName}`);
    logMessage(`Scaffold "${scaffoldName}" created successfully.`, true);
    refreshBlogsProvider(context);
  } catch (error) {
    handleError(error, "Failed to add scaffold");
  }
};

/**
 * Rename a file or directory.
 */
export const renameItem = async (
  element: TreeItem,
  context: ExtensionContext
) => {
  try {
    const { resourceUri, label, contextValue } = element;

    if (!resourceUri) {
      window.showWarningMessage("No item selected to rename.");
      return;
    }

    let oldPath: string;

    if (contextValue === "page") {
      oldPath = dirname(resourceUri.fsPath);
    } else {
      oldPath = resourceUri.fsPath;
    }

    const dir = dirname(oldPath);
    const ext = extname(oldPath);
    const baseName = basename(oldPath, ext);

    const newBaseName = await promptForName(`Rename "${label}" to:`, {
      value: baseName,
    });
    if (!newBaseName || newBaseName === baseName) return;

    const newName = newBaseName + ext;
    const newPath = join(dir, newName);
    if (existsSync(newPath)) {
      window.showErrorMessage(`"${newName}" already exists.`);
      return;
    }

    await workspace.fs.rename(Uri.file(oldPath), Uri.file(newPath));

    // Use the new file path to update the title
    let newTitlePath: string | undefined;
    if (contextValue === "page") {
      newTitlePath = join(newPath, "index.md");
    } else if (ext === ".md") {
      newTitlePath = newPath;
    }

    if (newTitlePath && existsSync(newTitlePath)) {
      await updateMarkdownTitle(newTitlePath, newBaseName);
    }

    logMessage(`Renamed "${label}" to "${newBaseName}".`, true);
    refreshBlogsProvider(context);
  } catch (error) {
    handleError(error, "Failed to rename item");
  }
};

/**
 * Update the title in the front-matter of a markdown file.
 */
export const updateMarkdownTitle = async (
  filePath: string,
  newTitle: string
): Promise<void> => {
  try {
    const file = readFileSync(filePath, "utf8");
    const data = fm.parse(file);
    data.title = newTitle;
    const newContent = fm.stringify(data, { prefixSeparator: true });
    writeFileSync(filePath, newContent, "utf8");
    logMessage(`Updated title to "${newTitle}" in ${filePath}`, true);
  } catch (error) {
    handleError(error, "Failed to update markdown title");
  }
};

/**
 * Test utility function.
 */
export const testSomething = async () => {
  try {
    logMessage("Test completed successfully", true);
  } catch (error) {
    handleError(error, "Failed to test");
  }
};
