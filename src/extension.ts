// src/extension.ts
import * as vscode from "vscode";
import { registerCommands } from "./commands/index";
import { registerActiveEditorChangeListener } from "./events";
import { loadAccessToken } from "./services/githubService";
import { BlogsTreeDataProvider } from "./views/blogsTreeDataProvider";
import { BlogsDragAndDropController } from "./views/BlogsDragAndDropController";
import { logMessage } from "./utils/logger";
import { previewPanel } from "./webview/markdownPreview";
import { localPreview } from "./commands/hexoCommands";

export function activate(context: vscode.ExtensionContext) {
  // Create an output channel
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
  // Register listener to trigger only when switching between files
  let lastActiveDocumentUri: vscode.Uri | undefined =
    vscode.window.activeTextEditor?.document.uri;

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (
      editor?.document.languageId === "markdown" &&
      editor.document.uri.toString() !== lastActiveDocumentUri?.toString()
    ) {
      lastActiveDocumentUri = editor.document.uri;
      if (previewPanel) {
        localPreview(editor.document.uri as any, context);
      }
    }
  });
}

export function deactivate() {}
