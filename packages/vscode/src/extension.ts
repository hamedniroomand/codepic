import { basename } from 'node:path';

import * as vscode from 'vscode';

import { buildOpenUrl } from './open-url';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('codepic.open', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        await vscode.window.showInformationMessage('Open a file to send its code to CodePic.');
        return;
      }
      const { document, selection } = editor;
      const code = document.getText(selection.isEmpty ? undefined : selection);
      if (!code.trim()) {
        await vscode.window.showInformationMessage('There is no code to send to CodePic.');
        return;
      }
      try {
        const url = await buildOpenUrl({
          code,
          languageId: document.languageId,
          fileName: basename(document.fileName),
        });
        await vscode.env.openExternal(vscode.Uri.parse(url, true));
      } catch (error) {
        await vscode.window.showErrorMessage(
          error instanceof Error ? error.message : String(error),
        );
      }
    }),
  );
}

export function deactivate(): void {}
