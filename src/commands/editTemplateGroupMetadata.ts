import { window } from 'vscode';

import { FolderType } from '../domain/config/types';
import { templatesService } from '../domain/templates/services';

import { getTemplateGroupFoldersQuickPickItems, WorkspaceFolderQuickPickItem } from './utils/folders';
import {
  askUserToCreateTemplate,
  askUserToCreateTemplateGroup,
  getTemplateGroupQuickPickItemsOfSelectedFolder,
  showTemplateGroupNameInputBox,
  showTemplatesUseSameVariablesQuickPick,
} from './utils/templateGroups';
import { getTemplateQuickPickItemsOfSelectedFolder, mapTemplateToQuickPickItem } from './utils/templates';

export const editTemplateGroupMetadata = async (): Promise<void> => {
  const foldersQuickPickItems = getTemplateGroupFoldersQuickPickItems();

  // If no workspace folders opened, automatically pick the global storage.
  const selectedFolderItem = foldersQuickPickItems.length === 1
    ? foldersQuickPickItems[0]
    : await window.showQuickPick(
      foldersQuickPickItems,
      { placeHolder: 'Where is the file template group you want to edit?' },
    );

  if (!selectedFolderItem) { return; }

  // Launch promise but do not wait on it now.
  const templatesQuickPickItemsPromise = getTemplateQuickPickItemsOfSelectedFolder(
    selectedFolderItem,
    true,
  );

  const templateGroupsQuickPickItems = await getTemplateGroupQuickPickItemsOfSelectedFolder(
    selectedFolderItem,
  );

  if (templateGroupsQuickPickItems.length === 0) {
    await askUserToCreateTemplateGroup(selectedFolderItem);
    return;
  }

  const selectedTemplateGroupItem = await window.showQuickPick(
    templateGroupsQuickPickItems,
    { placeHolder: 'Which file template group do you want to edit?' },
  );

  if (!selectedTemplateGroupItem) { return; }

  const templatesQuickPickItems = await templatesQuickPickItemsPromise;

  if (templatesQuickPickItems.length === 0) {
    const createdTemplate = await askUserToCreateTemplate(selectedFolderItem);

    if (!createdTemplate) { return; }

    templatesQuickPickItems.push({
      ...mapTemplateToQuickPickItem(createdTemplate),
      picked: true,
    });
  }

  const { templateGroup } = selectedTemplateGroupItem;

  const selectedTemplateItems = await window.showQuickPick(
    templatesQuickPickItems.map((item) => ({
      ...item,
      picked: (
        item.picked
        || templateGroup.metadata.templates.includes(item.template.metadata.id)
      ),
    })),
    {
      placeHolder: 'Select the file templates to put in your file template group.',
      canPickMany: true,
    },
  );

  if (selectedTemplateItems === undefined) { return; }

  const name = await showTemplateGroupNameInputBox(templateGroup.metadata.name);

  if (!name) { return; }

  const templatesUseSameVariablesItem = await showTemplatesUseSameVariablesQuickPick();

  if (!templatesUseSameVariablesItem) { return; }

  const updatedTemplateGroupMetatada = {
    ...templateGroup.metadata,
    name,
    templates: selectedTemplateItems.map((item) => item.template.metadata.id),
    templatesUseSameVariables: templatesUseSameVariablesItem.value,
  };

  if (selectedFolderItem.folderType === FolderType.Global) {
    await templatesService.editGlobalTemplateGroup(
      templateGroup.metadataFileUri,
      updatedTemplateGroupMetatada,
    );
  } else {
    await templatesService.editWorkspaceFolderTemplateGroup(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      templateGroup.metadataFileUri,
      updatedTemplateGroupMetatada,
    );
  }

  window.showInformationMessage(`File template group ${templateGroup.metadata.name} updated successfully.`);
};
