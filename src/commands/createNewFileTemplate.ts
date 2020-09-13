import * as vscode from 'vscode';

import { openTemplateEditor } from '../domain/editor';
import { getTemplate } from '../domain/templates';

const EDIT_ACTION = 'Edit that template instead';

/**
 * createNewFileTemplate command handler.
 */
export default async (): Promise<void> => {
  // Prompt for template name.
  const name = await vscode.window.showInputBox({
    prompt: 'Template name',
    placeHolder: 'React Component',
  });

  // If the user did not give a name, abort.
  if (!name) { return; }

  // If the user already has a template with this name, ask if he wants to edit it instead.
  const template = getTemplate(name);
  if (template) {
    const actionSelected = await vscode.window.showInformationMessage(
      `You already have a template with the name ${name}`,
      EDIT_ACTION,
    );

    // If the user clicks the edit action, open the editor.
    if (actionSelected === EDIT_ACTION) {
      await openTemplateEditor(name, template.ext);
      return;
    }

    // If the user dismisses the message, abort.
    if (actionSelected === undefined) {
      return;
    }
  }

  // If the user does not have a template with this name, ask for file extension.
  const ext = await vscode.window.showInputBox({
    prompt: 'File extension',
    placeHolder: '.jsx',
  });

  // If the user pressed Esc instead of providing an extension, abort.
  if (ext === undefined) { return; }

  // Open an empty editor with the correct extension (also provides syntax highlighting).
  await openTemplateEditor(name, ext);
};
