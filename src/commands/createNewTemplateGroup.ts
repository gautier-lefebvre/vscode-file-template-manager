import * as vscode from 'vscode';
import { createTemplateGroup, getTemplateGroupTemplates } from '../domain/templates';

import listTemplatesAndAskToCreateIfEmpty from './common/listTemplatesAndAskToCreateIfEmpty';
import mapTemplateNameToQuickPickItem from './common/mapTemplateNameToQuickPickItem';

const OVERWRITE_GROUP_ACTION = 'Overwrite the template group';

export default async (): Promise<void> => {
  const userTemplates = await listTemplatesAndAskToCreateIfEmpty();

  if (userTemplates === undefined) {
    return;
  }

  const selectedTemplates = await vscode.window.showQuickPick(
    userTemplates.map((name) => mapTemplateNameToQuickPickItem(name)),
    { canPickMany: true },
  );

  // If no template selected or user pressed Esc, abort.
  if (!selectedTemplates?.length) { return; }

  const templateGroupName = await vscode.window.showInputBox({
    prompt: 'Template group name',
    placeHolder: 'React Component Group',
  });

  // If no template group name given, return;
  if (!templateGroupName) { return; }

  const templateGroup = getTemplateGroupTemplates(templateGroupName);

  if (templateGroup !== undefined) {
    const actionSelected = await vscode.window.showInformationMessage(
      'There is already a template group with this name. Do you want to overwrite it?',
      OVERWRITE_GROUP_ACTION,
    );

    switch (actionSelected) {
      // If the user clicks the overwrite action, proceed.
      case OVERWRITE_GROUP_ACTION:
        break;
      // If the user dismisses the message, abort.
      default:
        return;
    }
  }

  await createTemplateGroup(templateGroupName, selectedTemplates.map((item) => item.label));
};
