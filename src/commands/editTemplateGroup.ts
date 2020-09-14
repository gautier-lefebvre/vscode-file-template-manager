import * as vscode from 'vscode';

import { editTemplateGroup, getTemplateGroupTemplates } from '../domain/templates';
import listTemplatesAndAskToCreateIfEmpty from './common/listTemplatesAndAskToCreateIfEmpty';
import mapTemplateNameToQuickPickItem from './common/mapTemplateNameToQuickPickItem';
import selectSingleTemplateGroup from './common/selectSingleTemplateGroup';

export default async (groupName?: string): Promise<void> => {
  // List template groups and templates. If any list is empty, the user is prompted to create one.
  const selectedGroupName = groupName || await selectSingleTemplateGroup();
  const userTemplates = await listTemplatesAndAskToCreateIfEmpty();

  // If the user has no groups or templates and pressed Esc, abort.
  if (!selectedGroupName || !userTemplates) { return; }

  // Get the list of templates of the selected template group.
  const templateGroupTemplates = getTemplateGroupTemplates(selectedGroupName);

  if (templateGroupTemplates === undefined) {
    // This should never happen.
    throw Error(`The template group '${selectedGroupName}' could not be found`);
  }

  // Show the list of templates, and pre-select templates that are already in the group.
  const selectedTemplates = await vscode.window.showQuickPick(
    userTemplates.map((name) => mapTemplateNameToQuickPickItem(
      name,
      templateGroupTemplates.includes(name),
    )),
    { canPickMany: true },
  );

  // If the user pressed Esc, abort.
  if (selectedTemplates === undefined) { return; }

  // Persist the template group.
  await editTemplateGroup(
    selectedGroupName,
    selectedTemplates.map((quickPickItem) => quickPickItem.label),
  );
};
