// src/panels/getHtml.ts
export function getDevHtml(port: number): string {
  const devUrl = `http://localhost:${port}`;
  const devWsUrl = `ws://localhost:${port}`;
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hexo Config Editor (Dev)</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${devUrl} 'unsafe-inline'; script-src ${devUrl} 'unsafe-eval' 'unsafe-inline'; connect-src ${devWsUrl} ${devUrl};">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${devUrl}/src/main.ts"></script>
  </body>
  </html>
  `;
}

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function getProdHtml(context: vscode.ExtensionContext): string {
  const indexPath = path.join(
    context.extensionPath,
    "media",
    "dist",
    "index.html"
  );
  let html = fs.readFileSync(indexPath, "utf-8");

  // 修复静态资源路径
  const baseUri = vscode.Uri.file(
    path.join(context.extensionPath, "media", "dist")
  );
  const webviewBaseUri = vscode.Uri.joinPath(baseUri);
  const fixPath = (s: string) =>
    s.replace(/(src|href)="\//g, `$1="${webviewBaseUri.toString()}/`);

  return fixPath(html);
}
