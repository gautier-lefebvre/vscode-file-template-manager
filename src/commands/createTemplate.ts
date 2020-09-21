import { window } from 'vscode';

import { Template } from '../domain/templates/data/template';
import { FolderType } from '../domain/config/types';
import { templatesService } from '../domain/templates/services';
import { FolderQuickPickItem, getCreateTemplateFoldersQuickPickItems, WorkspaceFolderQuickPickItem } from './utils/folders';
import { showFileTemplateNameInputBox, showOnlyAsPartOfGroupQuickPick, showTemplateNameInputBox } from './utils/templates';

export const createTemplate = async (
  folder?: FolderQuickPickItem,
): Promise<Template | undefined> => {
  const foldersQuickPickItems = folder
    ? [folder]
    : getCreateTemplateFoldersQuickPickItems();

  // If no workspace folders opened, automatically pick the global storage.
  const selectedFolderItem = foldersQuickPickItems.length === 1
    ? foldersQuickPickItems[0]
    : await window.showQuickPick(
      foldersQuickPickItems,
      { placeHolder: 'Where do you want to create your new file template?' },
    );

  if (!selectedFolderItem) { return undefined; }

  const name = await showTemplateNameInputBox();

  if (!name) { return undefined; }

  const fileTemplateName = await showFileTemplateNameInputBox();

  if (!fileTemplateName) { return undefined; }

  const onlyAsPartOfGroupItem = await showOnlyAsPartOfGroupQuickPick();

  if (!onlyAsPartOfGroupItem) { return undefined; }

  const templateToCreate = {
    name,
    fileTemplateName,
    onlyAsPartOfGroup: onlyAsPartOfGroupItem.value,
  };

  const createdTemplate = selectedFolderItem.folderType === FolderType.Global
    ? await templatesService.createGlobalTemplate(templateToCreate)
    : await templatesService.createWorkspaceFolderTemplate(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      templateToCreate,
    );

  await window.showTextDocument(createdTemplate.contentFileUri);

  window.showInformationMessage(`File template ${createdTemplate.metadata.name} created successfully.`);

  return createdTemplate;
};
