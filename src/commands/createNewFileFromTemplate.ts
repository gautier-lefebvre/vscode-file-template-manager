import { basename } from 'path';

import * as vscode from 'vscode';
import * as ejs from 'ejs';

import { getTemplate, listTemplates } from '../domain/templates';
import { TextDecoder } from 'util';

export default async (uri: vscode.Uri) => {
  const templateName = await vscode.window.showQuickPick(
    listTemplates(),
  );

  if (templateName) {
    const template = getTemplate(templateName);

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const fileName = await vscode.window.showInputBox({
      placeHolder: `MyComponent${template.ext}`,
      value: `MyComponent${template.ext}`,
      valueSelection: [0, 11],
    });

    if (fileName) {
      const baseFileName = basename(fileName, template.ext);
      const fileContent = await ejs.render(
        new TextDecoder('utf-8').decode(template.content),
        {
          baseFileName,
        },
        {
          async: true,
        },
      );

      const fileUri = vscode.Uri.joinPath(uri, fileName);

      const workspaceEdit = new vscode.WorkspaceEdit();
      workspaceEdit.createFile(fileUri);
      workspaceEdit.insert(fileUri, new vscode.Position(0, 0), fileContent);

      await vscode.workspace.applyEdit(workspaceEdit);

      const fileDocument = await vscode.workspace.openTextDocument(fileUri);
      vscode.window.showTextDocument(fileDocument);
    }
  }
};
