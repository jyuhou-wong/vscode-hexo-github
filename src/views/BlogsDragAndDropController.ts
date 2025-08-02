import * as vscode from "vscode";
import { rename } from "fs/promises";
import { basename, join } from "path";
import { DRAFTS_DIRNAME, POSTS_DIRNAME } from "../services/config";
import { BlogsTreeDataProvider, TreeItem } from "./blogsTreeDataProvider";
import { getHexoConfig } from "../services/hexoService";
import { logMessage } from "../extension";
import { statSync } from "fs";

export class BlogsDragAndDropController
  implements vscode.TreeDragAndDropController<TreeItem>
{
  dropMimeTypes = ["application/vnd.code.tree.vscode-hexo-github-blogs"];
  dragMimeTypes = ["application/vnd.code.tree.vscode-hexo-github-blogs"];

  constructor(private provider: BlogsTreeDataProvider) {}

  async handleDrag(
    source: readonly TreeItem[],
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ) {
    // 只允许 posts 下的节点能被拖动

    for (const item of source) {
      const { siteDir, resourceUri } = item;
      const config = await getHexoConfig(siteDir);
      const postDir = join(siteDir, config.source_dir, POSTS_DIRNAME);
      const draftsDir = join(siteDir, config.source_dir, DRAFTS_DIRNAME);

      if (
        !resourceUri?.fsPath.startsWith(postDir) &&
        !resourceUri?.fsPath.startsWith(draftsDir)
      ) {
        vscode.window.showErrorMessage(
          "Only files under the Posts and Drafts can be dragged."
        );
        return; // ❌ 不往 dataTransfer 里 set
      }
    }

    // 保存拖动项路径
    const paths = source
      .map((item) => item.uri?.fsPath)
      .filter(Boolean) as string[];
    dataTransfer.set(
      "application/vnd.code.tree.vscode-hexo-github-blogs",
      new vscode.DataTransferItem(paths.join(","))
    );
  }

  async handleDrop(
    target: TreeItem | undefined,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ) {
    if (!target) return;

    const isDirectory = statSync(target.uri!.fsPath).isDirectory();
    if (!isDirectory) return;

    const transferred = dataTransfer.get(
      "application/vnd.code.tree.vscode-hexo-github-blogs"
    );
    if (!transferred) return;

    const paths = (await transferred.asString()).split(",");

    for (const path of paths) {
      try {
        // 2. 移动文件/文件夹到 posts
        const newPath = join(target.uri!.fsPath, basename(path));
        await rename(path, newPath);
        vscode.window.showInformationMessage(`已移动: ${path} → ${newPath}`);
      } catch (err: any) {
        logMessage(`移动文件失败: ${err.message}`);
      }
    }

    // 3. 刷新 TreeView
    this.provider.refresh();
  }
}
