import { commands, window } from 'vscode';

import { COMMANDS } from '../constants';
import { Template } from '../domain/templates/data/template';
import { getTemplateFoldersQuickPickItems } from './utils/folders';
import { getTemplateQuickPickItemsOfSelectedFolder } from './utils/templates';

const CREATE_TEMPLATE_ACTION = 'Create a new file template';

export const editTemplate = async (): Promise<Template | undefined> => {
  const foldersQuickPickItems = getTemplateFoldersQuickPickItems();

  // If no workspace folders opened, automatically pick the global storage.
  const selectedFolderItem = foldersQuickPickItems.length === 1
    ? foldersQuickPickItems[0]
    : await window.showQuickPick(
      foldersQuickPickItems,
      { placeHolder: 'Where is the file template you want to edit?' },
    );

  if (!selectedFolderItem) { return undefined; }

  const templatesQuickPickItems = await getTemplateQuickPickItemsOfSelectedFolder(
    selectedFolderItem,
    true,
  );

  if (templatesQuickPickItems.length === 0) {
    const actionSelected = await window.showInformationMessage(
      'You do not have any file template in this folder. Do you want to create one instead?',
      CREATE_TEMPLATE_ACTION,
    );

    return actionSelected === CREATE_TEMPLATE_ACTION
      ? commands.executeCommand(
        COMMANDS.CREATE_TEMPLATE,
        selectedFolderItem,
      )
      : undefined;
  }

  const selectedTemplateItem = await window.showQuickPick(
    templatesQuickPickItems,
    { placeHolder: 'Which file template do you want to edit?' },
  );

  if (!selectedTemplateItem) { return undefined; }

  await window.showTextDocument(selectedTemplateItem.template.contentFileUri);

  return selectedTemplateItem.template;
};
