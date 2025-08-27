import * as vscode from "vscode";

let outputChannel: vscode.OutputChannel | undefined;

// Example function to log messages
export const logMessage = (
  message: string,
  show: boolean = false,
  type: "info" | "warn" | "error" = "info"
) => {
  const timestamp = new Date().toLocaleString();
  const formatMessage = `[${timestamp}] [${type}] ${message}`;
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("Hexo GitHub for VSCode");
  }
  outputChannel?.appendLine(formatMessage);

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
