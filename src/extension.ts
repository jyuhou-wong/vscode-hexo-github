import * as vscode from "vscode";
import { registerCommands } from "./commands/index";
import { startHexoServer } from "./commands/hexoCommands";

export function activate(context: vscode.ExtensionContext) {
  // 开启服务器
  startHexoServer();

  // 注册所有命令
  registerCommands(context);
}

// 该方法在扩展被停用时调用
export function deactivate() {}
