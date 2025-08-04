import * as vscode from "vscode";
import { getPreviewHtml } from "../../panels/getPreviewHtml";

export let previewPanel: vscode.WebviewPanel | undefined;

interface OpenHexoPreviewParams {
  previewUrl?: string;
  host?: string;
}

export function openHexoPreview({
  previewUrl,
  host,
}: OpenHexoPreviewParams): void {
  if (!previewUrl && !host) {
    vscode.window.showErrorMessage("Preview URL or host is required.");
    return;
  }

  if (previewPanel) {
    // 如果已存在，直接刷新内容并聚焦
    previewPanel.webview.postMessage({
      type: "refresh-preview",
      host,
      previewUrl,
    });
    return;
  }

  previewPanel = vscode.window.createWebviewPanel(
    "hexoPreview",
    "Hexo 博客预览",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  previewPanel.webview.html = getPreviewHtml(previewUrl!);

  previewPanel.onDidDispose(() => {
    previewPanel = undefined;
  });
}
