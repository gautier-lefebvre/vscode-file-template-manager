import * as vscode from 'vscode';

import listTemplateGroupsAndAskToCreateIfEmpty from './listTemplateGroupsAndAskToCreateIfEmpty';

/**
 * Prompt the user to select a template.
 * If no template is found, prompt the user to create a template.
 * Return the selected template name, or undefined if the command is aborted.
 */
export default async (): Promise<string | undefined> => {
  const userTemplateGroups = await listTemplateGroupsAndAskToCreateIfEmpty();

  return userTemplateGroups === undefined
    ? undefined
    : vscode.window.showQuickPick(
      userTemplateGroups,
    );
};
