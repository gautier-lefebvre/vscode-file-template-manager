import * as vscode from 'vscode';

import { CREATE_FILE_TEMPLATE_COMMAND_ID } from '../../config/constants';
import { listTemplates } from '../../domain/templates';

const CREATE_FILE_TEMPLATE_ACTION = 'Create a new template';

/**
 * Prompt the user to select a template.
 * If no template is found, prompt the user to create a template.
 * Return the selected template name, or undefined if the command is aborted.
 */
export default async (): Promise<string | undefined> => {
  const userTemplates = listTemplates();

  // If the user has no templates, show message to allow him to create a file template.
  if (!userTemplates.length) {
    const actionSelected = await vscode.window.showInformationMessage(
      'You do not have any template yet.',
      CREATE_FILE_TEMPLATE_ACTION,
    );

    // If the user clicks on the create file template action, execute the template creation command.
    if (actionSelected === CREATE_FILE_TEMPLATE_ACTION) {
      await vscode.commands.executeCommand(CREATE_FILE_TEMPLATE_COMMAND_ID);
      return undefined;
    }

    // If the user dismisses the message, abort.
    if (actionSelected === undefined) {
      return undefined;
    }
  }

  // Load all user templates and prompt user to select one.
  const selectedTemplateName = await vscode.window.showQuickPick(
    userTemplates,
  );

  return selectedTemplateName;
};
