import {
  commands,
  FileSystemError,
  Uri,
  window,
  workspace,
} from 'vscode';

import { COMMANDS } from '../constants';
import { TemplateRenderer } from '../domain/renderer/templateRenderer';
import { Template } from '../domain/templates/data/template';
import { generateFileName } from '../domain/templates/data/template/utils';

import { promptUserForTemplatesVariablesValues } from './utils/templateGroups';
import { getTemplatesOfWorkspaceFolderQuickPickItems, getGlobalTemplatesQuickPickItems } from './utils/templates';

export const createFileFromTemplate = async (baseFolderUri: Uri): Promise<void> => {
  const workspaceFolder = workspace.getWorkspaceFolder(baseFolderUri);

  if (!workspaceFolder) {
    window.showErrorMessage('Cannot create files outside of a workspace folder.');
    return;
  }

  const templatesQuickPickItems = (
    await Promise.all([
      getTemplatesOfWorkspaceFolderQuickPickItems(workspaceFolder.uri),
      getGlobalTemplatesQuickPickItems(),
    ])
  ).reduce((acc, array) => acc.concat(array), []);

  let template: Template | undefined;

  if (templatesQuickPickItems.length === 0) {
    const CREATE_TEMPLATE_ACTION = 'Create a new file template';

    const actionSelected = await window.showInformationMessage(
      'You do not have any file template in this folder. Do you want to create one?',
      CREATE_TEMPLATE_ACTION,
    );

    if (actionSelected === undefined) { return; }

    template = await commands.executeCommand(COMMANDS.CREATE_TEMPLATE);
  } else {
    const selectedTemplateItem = await window.showQuickPick(
      templatesQuickPickItems,
      { placeHolder: 'Which file template do you want to use?' },
    );

    template = selectedTemplateItem?.template;
  }

  if (!template) { return; }

  const templateRenderer = new TemplateRenderer(template);

  const variablesPerTemplates = await promptUserForTemplatesVariablesValues(
    true,
    [templateRenderer],
    baseFolderUri,
  );

  if (!variablesPerTemplates) { return; }

  const templateVariables = variablesPerTemplates[templateRenderer.template.metadata.id];

  const fileUri = Uri.joinPath(
    baseFolderUri,
    generateFileName(templateRenderer.template.metadata.fileTemplateName, templateVariables),
  );

  try {
    await workspace.fs.stat(fileUri);

    const OVERWRITE_ACTION = 'Overwrite the file';

    const actionSelected = await window.showWarningMessage(
      `The file at path ${fileUri.path} already exists. Do you want to overwrite it?`,
      OVERWRITE_ACTION,
    );

    if (actionSelected !== OVERWRITE_ACTION) { return; }
  } catch (err) {
    // Ignore FileNotFound.
    if (!(err instanceof FileSystemError && err.code === 'FileNotFound')) { throw err; }
  }

  await templateRenderer.renderToFile(
    fileUri,
    templateVariables,
    [templateRenderer.template],
  );

  await window.showTextDocument(fileUri);
};
