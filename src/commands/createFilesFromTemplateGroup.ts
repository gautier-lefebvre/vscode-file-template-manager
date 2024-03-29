import {
  commands,
  FileSystemError,
  Uri,
  window,
  workspace,
} from 'vscode';

import { COMMANDS } from '../constants';
import { FolderType } from '../domain/config/types';
import { TemplateRenderer } from '../domain/renderer/templateRenderer';
import { generateFileName } from '../domain/templates/data/template/utils';
import { TemplateGroup } from '../domain/templates/data/templateGoup';
import { templatesService } from '../domain/templates/services';
import { compact } from '../utils/array';

import { getGlobalTemplateGroupsQuickPickItems, getTemplateGroupsOfWorkspaceFolderQuickPickItems, promptUserForTemplatesVariablesValues } from './utils/templateGroups';

export const createFilesFromTemplateGroup = async (baseFolderUri: Uri): Promise<void> => {
  const workspaceFolder = workspace.getWorkspaceFolder(baseFolderUri);

  if (!workspaceFolder) {
    window.showErrorMessage('Cannot create files outside of a workspace folder.');
    return;
  }

  const templateGroupsQuickPickItems = (
    await Promise.all([
      getTemplateGroupsOfWorkspaceFolderQuickPickItems(workspaceFolder.uri),
      getGlobalTemplateGroupsQuickPickItems(),
    ])
  ).reduce((acc, array) => acc.concat(array), []);

  let templateGroup: TemplateGroup | undefined;

  if (templateGroupsQuickPickItems.length === 0) {
    const CREATE_TEMPLATE_GROUP_ACTION = 'Create a new file template group';

    const actionSelected = await window.showInformationMessage(
      'You do not have any file template group in this folder. Do you want to create one?',
      CREATE_TEMPLATE_GROUP_ACTION,
    );

    if (actionSelected === undefined) { return; }

    templateGroup = await commands.executeCommand(COMMANDS.CREATE_TEMPLATE_GROUP);
  } else {
    const selectedTemplateGroupItem = await window.showQuickPick(
      templateGroupsQuickPickItems,
      { placeHolder: 'Which file template group do you want to use?' },
    );

    templateGroup = selectedTemplateGroupItem?.templateGroup;
  }

  if (!templateGroup) { return; }

  const { folderType } = templateGroup.folderConfiguration;

  const templatesOfGroup = compact(
    await Promise.all(templateGroup.metadata.templates.map((templateId) => (
      folderType === FolderType.Global
        ? templatesService.getGlobalTemplateById(templateId)
        : templatesService.getTemplateOfWorkspaceFolderById(workspaceFolder.uri, templateId)
    ))),
  ).map((template) => new TemplateRenderer(template));

  const variablesPerTemplates = await promptUserForTemplatesVariablesValues(
    templateGroup.metadata.templatesUseSameVariables,
    templatesOfGroup,
    baseFolderUri,
  );

  if (!variablesPerTemplates) { return; }

  const filesUris = await Promise.all(templatesOfGroup.map(
    async (templateRenderer): Promise<{
      templateRenderer: TemplateRenderer;
      fileUri: Uri;
      exists: boolean;
    }> => {
      const { fileTemplateName, id } = templateRenderer.template.metadata;

      const fileUri = Uri.joinPath(
        baseFolderUri,
        generateFileName(fileTemplateName, variablesPerTemplates[id]),
      );

      let exists = false;

      try {
        await workspace.fs.stat(fileUri);
        exists = true;
      } catch (err) {
        if (err instanceof FileSystemError && err.code === 'FileNotFound') {
          exists = false;
        } else {
          throw err;
        }
      }

      return { templateRenderer, fileUri, exists };
    },
  ));

  const filesThatExist = filesUris.filter(({ exists }) => !!exists);

  if (filesThatExist.length > 0) {
    const OVERWRITE_ACTION = filesThatExist.length > 1
      ? 'Overwrite the files'
      : 'Overwrite the file';

    const actionSelected = await window.showWarningMessage(
      filesThatExist.length > 1
        ? `The files at path ${filesThatExist.map(({ fileUri }) => fileUri.path).join(', ')} already exist. Do you want to overwrite them all?`
        : `The file at path ${filesThatExist[0].fileUri.path} already exists. Do you want to overwrite it?`,
      OVERWRITE_ACTION,
    );

    if (actionSelected !== OVERWRITE_ACTION) { return; }
  }

  // Create each file.
  await Promise.all(filesUris.map(({ templateRenderer, fileUri }) => (
    templateRenderer.renderToFile(
      fileUri,
      variablesPerTemplates[templateRenderer.template.metadata.id],
      templatesOfGroup.map(({ template }) => template),
    )
  )));

  // Open the files in the editor.
  await Promise.all(filesUris.map(async ({ fileUri }) => (
    window.showTextDocument(fileUri, { preview: false })
  )));
};
