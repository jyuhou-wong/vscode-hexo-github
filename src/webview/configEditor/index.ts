import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import yaml from "js-yaml";
import { TreeItem } from "../../views/blogsTreeDataProvider";
import { getDevHtml, getProdHtml } from "../../panels/getHtml";
import {
  serverStatusMap,
  startHexoServer,
  stopHexoServer,
} from "../../commands/hexoCommands";

export function registerConfigEditor(
  element: TreeItem,
  context: vscode.ExtensionContext
) {
  const panel = vscode.window.createWebviewPanel(
    "hexoConfigEditor",
    "Hexo 配置编辑器",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, "media", "dist")),
        vscode.Uri.file(path.dirname(element?.resourceUri?.fsPath!)), // 允许 WebView 访问文件
      ],
    }
  );

  const isDev =
    process.env.NODE_ENV === "development" || // 来自 launch.json（可选）
    process.argv.some((arg) => arg.includes("--extensionDevelopmentPath"));

  panel.webview.html = isDev
    ? getDevHtml(5173) // 使用开发服务器端口
    : getProdHtml(context, panel.webview);

  // 接收保存消息
  panel.webview.onDidReceiveMessage((msg) => {
    console.log("Received message:", msg);
    // 初始发送配置
    const yamlText = fs.readFileSync(element?.resourceUri?.fsPath!, "utf-8");
    const config = yaml.load(yamlText);
    if (msg.type === "app-ready") {
      panel.webview.postMessage({
        type: "load-config",
        data: config,
        route: "/config",
      });
    }

    if (msg.type === "save-config") {
      const newYaml = yaml.dump(msg.data);
      fs.writeFileSync(element?.resourceUri?.fsPath!, newYaml, "utf-8");
      vscode.window.showInformationMessage("配置已保存！");

      panel.webview.postMessage({
        type: "load-config",
        data: msg.data,
        route: "/config",
      });

      if (serverStatusMap.get(element.siteName)) {
        stopHexoServer(element, context).then(() => {
          // 重新启动 Hexo 服务器
          startHexoServer(element, context);
        });
      }
    }
  });
}
