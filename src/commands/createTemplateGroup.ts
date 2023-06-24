import { window } from 'vscode';

import { FolderType } from '../domain/config/types';
import { TemplateGroup } from '../domain/templates/data/templateGoup';
import { templatesService } from '../domain/templates/services';

import { FolderQuickPickItem, getCreateTemplateGroupFoldersQuickPickItems, WorkspaceFolderQuickPickItem } from './utils/folders';
import { askUserToCreateTemplate, showTemplateGroupNameInputBox, showTemplatesUseSameVariablesQuickPick } from './utils/templateGroups';
import { getTemplateQuickPickItemsOfSelectedFolder, mapTemplateToQuickPickItem } from './utils/templates';

export const createTemplateGroup = async (
  folder?: FolderQuickPickItem,
): Promise<TemplateGroup | undefined> => {
  const foldersQuickPickItems = folder
    ? [folder]
    : getCreateTemplateGroupFoldersQuickPickItems();

  // If no workspace folders opened, automatically pick the global storage.
  const selectedFolderItem = foldersQuickPickItems.length === 1
    ? foldersQuickPickItems[0]
    : await window.showQuickPick(
      foldersQuickPickItems,
      { placeHolder: 'Where do you want to create your new file template group?' },
    );

  if (!selectedFolderItem) { return; }

  const templatesQuickPickItems = await getTemplateQuickPickItemsOfSelectedFolder(
    selectedFolderItem,
    true,
  );

  if (templatesQuickPickItems.length === 0) {
    const createdTemplate = await askUserToCreateTemplate(selectedFolderItem);

    if (!createdTemplate) { return; }

    templatesQuickPickItems.push({
      ...mapTemplateToQuickPickItem(createdTemplate),
      picked: true,
    });
  }

  const selectedTemplateItems = await window.showQuickPick(
    templatesQuickPickItems,
    {
      placeHolder: 'Select the file templates to add to your file template group.',
      canPickMany: true,
    },
  );

  if (!selectedTemplateItems?.length) { return; }

  const name = await showTemplateGroupNameInputBox();

  if (!name) { return; }

  const templatesUseSameVariablesItem = await showTemplatesUseSameVariablesQuickPick();

  if (!templatesUseSameVariablesItem) { return; }

  const templateGroupToCreate = {
    name,
    templates: selectedTemplateItems.map((item) => item.template.metadata.id),
    templatesUseSameVariables: templatesUseSameVariablesItem.value,
  };

  const templateGroup = selectedFolderItem.folderType === FolderType.Global
    ? await templatesService.createGlobalTemplateGroup(templateGroupToCreate)
    : await templatesService.createWorkspaceFolderTemplateGroup(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      templateGroupToCreate,
    );

  window.showInformationMessage(`File template group ${templateGroup.metadata.name} created successfully.`);
};
