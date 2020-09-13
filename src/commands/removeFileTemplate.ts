import * as vscode from 'vscode';

import { getTemplate } from '../domain/templates';
import { createTemplateEditorUri } from '../domain/editor';
import selectSingleTemplate from './common/selectSingleTemplate';

export default async (): Promise<void> => {
  // Prompt the user to select a template a create one if no templates were found.
  const templateToRemove = await selectSingleTemplate();

  // If no template selected, abort.
  if (!templateToRemove) { return; }

  // Find the template.
  const template = getTemplate(templateToRemove);
  if (!template) {
    // This should not happen.
    // Probably means that a template was removed but not from the template list memento.
    throw new Error(`Template not found: ${templateToRemove}`);
  }

  // Remove the template as a file. The template file system provider will catch the delete action.
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.deleteFile(createTemplateEditorUri(template.name, template.ext));
  await vscode.workspace.applyEdit(workspaceEdit);
};
