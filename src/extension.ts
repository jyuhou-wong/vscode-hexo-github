// src/extension.ts
import * as vscode from "vscode";
import { registerCommands } from "./commands/index";
import { registerActiveEditorChangeListener } from "./events";
import { loadAccessToken } from "./services/githubService";
import { BlogsTreeDataProvider } from "./views/blogsTreeDataProvider";
import { BlogsDragAndDropController } from "./views/BlogsDragAndDropController";

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  // Create an output channel
  outputChannel = vscode.window.createOutputChannel("Hexo GitHub");
  logMessage(
    'Congratulations, your extension "vscode-hexo-github" is now active!'
  );

  // Load local token
  loadAccessToken();

  // Register commands
  registerCommands(context);

  // 创建 TreeDataProvider
  const blogsProvider = new BlogsTreeDataProvider(context);
  // 创建 TreeView
  const blogsTreeView = vscode.window.createTreeView(
    "vscode-hexo-github-blogs",
    {
      treeDataProvider: blogsProvider,
      dragAndDropController: new BlogsDragAndDropController(blogsProvider),
    }
  );
  // 注册资源
  context.subscriptions.push(blogsProvider);
  context.subscriptions.push(blogsTreeView);

  // Register custom events
  registerActiveEditorChangeListener(context);
}

export function deactivate() {}

// Example function to log messages
export const logMessage = (
  message: string,
  show: boolean = false,
  type: "info" | "warn" | "error" = "info"
) => {
  const timestamp = new Date().toLocaleString();
  const formatMessage = `[${timestamp}] [${type}] ${message}`;
  outputChannel.appendLine(formatMessage);

  if (!show) {
    return;
  }

  switch (type) {
    case "info":
      vscode.window.showInformationMessage(message);
      break;
    case "warn":
      vscode.window.showWarningMessage(message);
      break;
    case "error":
      vscode.window.showErrorMessage(message);
      break;
  }
};
