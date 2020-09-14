import * as vscode from 'vscode';

import { CREATE_TEMPLATE_GROUP_COMMAND_ID } from '../../config/constants';
import { getTemplateGroupsNames } from '../../domain/templates';

const CREATE_FILE_GROUP_ACTION = 'Create a new template group';

/**
 * Prompt the user to select a template.
 * If no template is found, prompt the user to create a template.
 * Return the list of templates or undefined if the command is aborted.
 */
export default async (): Promise<string[] | undefined> => {
  const userTemplateGroups = getTemplateGroupsNames();

  // If the user has no template groups, show message to allow him to create a template group.
  if (!userTemplateGroups.length) {
    const actionSelected = await vscode.window.showInformationMessage(
      'You do not have any template group yet.',
      CREATE_FILE_GROUP_ACTION,
    );

    // If the user clicks on the create template group action,
    // execute the template group creation command.
    if (actionSelected === CREATE_FILE_GROUP_ACTION) {
      await vscode.commands.executeCommand(CREATE_TEMPLATE_GROUP_COMMAND_ID);
      return undefined;
    }

    // If the user dismisses the message, abort.
    if (actionSelected === undefined) {
      return undefined;
    }
  }

  return userTemplateGroups;
};
