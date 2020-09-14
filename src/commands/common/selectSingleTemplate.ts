import * as vscode from 'vscode';

import listTemplatesAndAskToCreateIfEmpty from './listTemplatesAndAskToCreateIfEmpty';
import mapTemplateNameToQuickPickItem from './mapTemplateNameToQuickPickItem';

/**
 * Prompt the user to select a template.
 * If no template is found, prompt the user to create a template.
 * Return the selected template name, or undefined if the command is aborted.
 */
export default async (): Promise<string | undefined> => {
  const userTemplates = await listTemplatesAndAskToCreateIfEmpty();

  if (!userTemplates) { return undefined; }

  const selectedTemplate = await vscode.window.showQuickPick(
    userTemplates.map((name) => mapTemplateNameToQuickPickItem(name)),
  );

  return selectedTemplate?.label;
};
