import { window } from 'vscode';

import { FolderType } from '../domain/config/types';
import { templatesService } from '../domain/templates/services';

import { getTemplateGroupFoldersQuickPickItems, WorkspaceFolderQuickPickItem } from './utils/folders';
import { getTemplateGroupQuickPickItemsOfSelectedFolder } from './utils/templateGroups';

export const removeTemplateGroup = async (): Promise<void> => {
  const foldersQuickPickItems = getTemplateGroupFoldersQuickPickItems();

  // If no workspace folders opened, automatically pick the global storage.
  const selectedFolderItem = foldersQuickPickItems.length === 1
    ? foldersQuickPickItems[0]
    : await window.showQuickPick(
      foldersQuickPickItems,
      { placeHolder: 'Where is the file template group you want to delete?' },
    );

  if (!selectedFolderItem) { return; }

  const templateGroupsQuickPickItems = await getTemplateGroupQuickPickItemsOfSelectedFolder(
    selectedFolderItem,
    true,
  );

  if (templateGroupsQuickPickItems.length === 0) {
    await window.showInformationMessage('You do not have any file template group in this folder. Ignoring.');
    return;
  }

  const selectedTemplateGroupItem = await window.showQuickPick(
    templateGroupsQuickPickItems,
    { placeHolder: 'Which file template group do you want to delete?' },
  );

  if (!selectedTemplateGroupItem) { return; }

  const { templateGroup } = selectedTemplateGroupItem;

  if (selectedFolderItem.folderType === FolderType.Global) {
    await templatesService.removeGlobalTemplateGroup(templateGroup.metadataFileUri);
  } else {
    await templatesService.removeWorkspaceFolderTemplateGroup(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      templateGroup.metadataFileUri,
    );
  }

  window.showInformationMessage(`File template group ${templateGroup.metadata.name} deleted successfully.`);
};
