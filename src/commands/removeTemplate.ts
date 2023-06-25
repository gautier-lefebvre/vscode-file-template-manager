import { window } from 'vscode';

import { FolderType } from '../domain/config/types';
import { templatesService } from '../domain/templates/services';

import { getTemplateFoldersQuickPickItems, WorkspaceFolderQuickPickItem } from './utils/folders';
import { getTemplateQuickPickItemsOfSelectedFolder } from './utils/templates';

export const removeTemplate = async (): Promise<void> => {
  const foldersQuickPickItems = getTemplateFoldersQuickPickItems();

  // If no workspace folders opened, automatically pick the global storage.
  const selectedFolderItem = foldersQuickPickItems.length === 1
    ? foldersQuickPickItems[0]
    : await window.showQuickPick(
      foldersQuickPickItems,
      { placeHolder: 'Where is the file template you want to delete?' },
    );

  if (!selectedFolderItem) { return; }

  const templatesQuickPickItems = await getTemplateQuickPickItemsOfSelectedFolder(
    selectedFolderItem,
    true,
  );

  if (templatesQuickPickItems.length === 0) {
    await window.showInformationMessage('You do not have any file template in this folder. Ignoring.');
    return;
  }

  const selectedTemplateItem = await window.showQuickPick(
    templatesQuickPickItems,
    { placeHolder: 'Which file template do you want to delete?' },
  );

  if (!selectedTemplateItem) { return; }

  const { template } = selectedTemplateItem;

  if (selectedFolderItem.folderType === FolderType.Global) {
    await templatesService.removeGlobalTemplate(template.folderUri);
  } else {
    await templatesService.removeWorkspaceFolderTemplate(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      template.folderUri,
    );
  }

  window.showInformationMessage(`File template ${template.metadata.name} deleted successfully.`);
};
