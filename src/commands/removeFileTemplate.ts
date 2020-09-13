import * as vscode from 'vscode';

import { getTemplate, listTemplates } from '../domain/templates';
import { createTemplateEditorUri } from '../domain/editor';

export default async (): Promise<void> => {
  const name = await vscode.window.showQuickPick(
    listTemplates(),
  );

  if (name) {
    const template = getTemplate(name);

    if (!template) {
      throw Error(`Template not found: ${name}`);
    }

    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.deleteFile(createTemplateEditorUri(template.name, template.ext));
    await vscode.workspace.applyEdit(workspaceEdit);
  }
};
