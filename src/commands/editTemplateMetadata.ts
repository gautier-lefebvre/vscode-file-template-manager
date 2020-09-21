import { commands, window } from 'vscode';
import { COMMANDS } from '../constants';

import { FolderType } from '../domain/config/types';
import { templatesService } from '../domain/templates/services';
import { getTemplateFoldersQuickPickItems, WorkspaceFolderQuickPickItem } from './utils/folders';
import {
  getTemplateQuickPickItemsOfSelectedFolder,
  showFileTemplateNameInputBox,
  showOnlyAsPartOfGroupQuickPick,
  showTemplateNameInputBox,
} from './utils/templates';

const CREATE_TEMPLATE_ACTION = 'Create a new file template';

export const editTemplateMetadata = async (): Promise<void> => {
  const foldersQuickPickItems = getTemplateFoldersQuickPickItems();

  // If no workspace folders opened, automatically pick the global storage.
  const selectedFolderItem = foldersQuickPickItems.length === 1
    ? foldersQuickPickItems[0]
    : await window.showQuickPick(
      foldersQuickPickItems,
      { placeHolder: 'Where is the file template you want to edit?' },
    );

  if (!selectedFolderItem) { return; }

  const templatesQuickPickItems = await getTemplateQuickPickItemsOfSelectedFolder(
    selectedFolderItem,
    true,
  );

  if (templatesQuickPickItems.length === 0) {
    const actionSelected = await window.showInformationMessage(
      'You do not have any file template in this folder. Do you want to create one instead?',
      CREATE_TEMPLATE_ACTION,
    );

    if (actionSelected === CREATE_TEMPLATE_ACTION) {
      await commands.executeCommand(
        COMMANDS.CREATE_TEMPLATE,
        selectedFolderItem,
      );
    }

    return;
  }

  const selectedTemplateItem = await window.showQuickPick(
    templatesQuickPickItems,
    { placeHolder: 'Which file template do you want to edit?' },
  );

  if (!selectedTemplateItem) { return; }

  const { template } = selectedTemplateItem;

  const name = await showTemplateNameInputBox(template.metadata.name);

  if (!name) { return; }

  const fileTemplateName = await showFileTemplateNameInputBox(template.metadata.fileTemplateName);

  if (!fileTemplateName) { return; }

  const onlyAsPartOfGroupItem = await showOnlyAsPartOfGroupQuickPick();

  if (!onlyAsPartOfGroupItem) { return; }

  const updatedTemplateMetatada = {
    ...template.metadata,
    name,
    fileTemplateName,
    onlyAsPartOfGroup: onlyAsPartOfGroupItem.value,
  };

  if (selectedFolderItem.folderType === FolderType.Global) {
    await templatesService.editGlobalTemplate(template.metadataFileUri, updatedTemplateMetatada);
  } else {
    await templatesService.editWorkspaceFolderTemplate(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      template.metadataFileUri,
      updatedTemplateMetatada,
    );
  }

  window.showInformationMessage(`File template ${template.metadata.name} updated successfully.`);
};
