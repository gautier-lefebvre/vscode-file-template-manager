import * as vscode from 'vscode';

import { openTemplateEditor } from '../domain/editor';

export default async () => {
  const name = await vscode.window.showInputBox({
    prompt: 'Template name',
    placeHolder: 'React Component',
  });

  if (!name) { return; }

  const ext = await vscode.window.showInputBox({
    prompt: 'File extension',
    placeHolder: '.jsx',
  });

  if (ext === undefined) { return; }

  await openTemplateEditor(name, ext);
};
