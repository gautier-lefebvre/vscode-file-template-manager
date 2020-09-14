import { basename } from 'path';
import { TextDecoder } from 'util';

import * as vscode from 'vscode';
import * as ejs from 'ejs';

import { getTemplate } from '../domain/templates';
import selectSingleTemplate from './common/selectSingleTemplate';

const OVERWRITE_FILE_ACTION = 'Overwrite the file';
const CANCEL_ACTION = 'Cancel';

/**
 * createNewFileFromTemplate command handler.
 */
export default async (uri: vscode.Uri): Promise<void> => {
  // Prompt the user to select a template a create one if no templates were found.
  const templateName = await selectSingleTemplate();

  // If the user dismisses the selection, abort.
  if (!templateName) {
    return;
  }

  // Load the template.
  const template = getTemplate(templateName);
  if (!template) {
    // This should not happen.
    // Probably means that a template was removed but not from the template list memento.
    throw new Error(`Template not found: ${templateName}`);
  }

  // Prompt user for the path of the file he wants to create.
  const fileName = await vscode.window.showInputBox({
    prompt: 'New file name',
    placeHolder: `MyComponent${template.ext || ''}`,
    // Pre-fill the value with the extension.
    value: `MyComponent${template.ext || ''}`,
    // Pre-select the name of the file without the extension.
    valueSelection: [0, 11],
  });

  // If no file name is provided, abort.
  if (!fileName) {
    return;
  }

  // Create the full path of the file relative to the uri the user selected in the file tree.
  const fileUri = vscode.Uri.joinPath(uri, fileName);

  const workspaceEdit = new vscode.WorkspaceEdit();

  // Check if the file already exists.
  try {
    // This throws if the file does not exist.
    await vscode.workspace.fs.stat(fileUri);

    // If the file already exists, ask if the user wants to overwrite it.
    const actionSelected = await vscode.window.showInformationMessage(
      'This file already exists. Do you want to overwrite it?',
      OVERWRITE_FILE_ACTION,
      CANCEL_ACTION,
    );

    // If the user dismisses the message or clicks the cancel action, abort.
    if (actionSelected === undefined || actionSelected === CANCEL_ACTION) {
      return;
    }

    // If the user clicks the overwrite action, truncate the file.
    if (actionSelected === OVERWRITE_FILE_ACTION) {
      const fileDocument = await vscode.workspace.openTextDocument(fileUri);

      workspaceEdit.delete(
        fileUri,
        new vscode.Range(
          fileDocument.lineAt(0).range.start,
          fileDocument.lineAt(fileDocument.lineCount - 1).range.end,
        ),
      );
    }
  } catch (err) {
    // The file does not exist, create it.
    workspaceEdit.createFile(fileUri);
  }

  // If fileName is my-component/MyComponent.jsx, baseFileName is MyComponent.
  const baseFileName = basename(fileName, template.ext);

  // Use the template to generate the file content using ejs.
  const fileContent = await ejs.render(
    new TextDecoder('utf-8').decode(template.content),
    {
      baseFileName,
    },
    { async: true },
  );

  // Write the file content in the file.
  workspaceEdit.insert(fileUri, new vscode.Position(0, 0), fileContent);
  await vscode.workspace.applyEdit(workspaceEdit);

  // Display the generated file in the editor.
  const fileDocument = await vscode.workspace.openTextDocument(fileUri);
  vscode.window.showTextDocument(fileDocument);
};
