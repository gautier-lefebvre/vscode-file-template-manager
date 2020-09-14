import { basename } from 'path';
import { TextDecoder } from 'util';

import * as vscode from 'vscode';
import * as ejs from 'ejs';

import { EDIT_TEMPLATE_GROUP_COMMAND_ID } from '../config/constants';
import { getTemplate, getTemplateGroupTemplates } from '../domain/templates';
import selectSingleTemplateGroup from './common/selectSingleTemplateGroup';

const EDIT_GROUP_TEMPLATE_ACTION = 'Edit the template group';
const OVERWRITE_SINGLE_FILE_ACTION = 'Overwrite it';
const OVERWRITE_MULTIPLE_FILES_ACTION = 'Overwrite them all';

export default async (uri: vscode.Uri): Promise<void> => {
  const groupName = await selectSingleTemplateGroup();

  // User dismissed the select or had no template groups, abort.
  if (!groupName) { return; }

  const templateGroupTemplatesNames = getTemplateGroupTemplates(groupName);

  // If there are no templates in this template group, ask user to edit it and abort.
  if (!templateGroupTemplatesNames?.length) {
    const actionSelected = await vscode.window.showInformationMessage(
      `The template group '${groupName}' does not have any associated templates. Do you want to edit it?`,
      EDIT_GROUP_TEMPLATE_ACTION,
    );

    switch (actionSelected) {
      // If the user clicks the edit template group action, execute the command and abort.
      case EDIT_GROUP_TEMPLATE_ACTION: {
        await vscode.commands.executeCommand(
          EDIT_TEMPLATE_GROUP_COMMAND_ID,
          groupName,
        );
        return;
      }

      // If the user dismissed the message, abort.
      default:
        return;
    }
  }

  // This is the path without the extension added by each template.
  // E.g for templates with .jsx and .stories.mdx extensions,
  // to create my-component/MyComponent.jsx and my-component/MyComponent.stories.mdx,
  // baseFilePath is 'my-component/MyComponent'.
  const baseFilePath = await vscode.window.showInputBox({
    prompt: 'New files base path (without extension)',
    placeHolder: 'MyComponent',
    // Pre-fill the value with a example name.
    value: 'MyComponent',
    // Pre-select the value.
    valueSelection: [0, 11],
  });

  // User dismissed the input, abort.
  if (!baseFilePath) { return; }

  // my-component/MyComponent -> MyComponent.
  const baseFileName = basename(baseFilePath);

  // Load the templates of the template group.
  const templateGroupTemplates = templateGroupTemplatesNames.map((name) => {
    const template = getTemplate(name);

    if (!template) {
      throw Error(`The template '${name}' could not be found.`);
    }

    return template;
  });

  // Compute the URI of all files that will be generated.
  const filesToRender = templateGroupTemplates.map((template) => ({
    template,
    fileUri: vscode.Uri.joinPath(
      uri,
      `${baseFilePath}${template.ext || ''}`,
    ),
  }));

  // Check which file already exist, to ask the user if he wants to overwrite them.
  const filesExist = await Promise.all(
    filesToRender.map(async ({ fileUri }) => {
      try {
      // This throws if the file does not exist.
        await vscode.workspace.fs.stat(fileUri);

        return { fileUri, exists: true };
      } catch (err) {
        return { fileUri, exists: false };
      }
    }),
  );

  const filesThatExist = filesExist.filter((file) => file.exists);
  const filesThatDontExist = filesExist.filter((file) => !file.exists);

  const workspaceEdit = new vscode.WorkspaceEdit();

  // Create the files that don't exist yet.
  // For some reason this needs to be done before truncating existing files.
  filesThatDontExist.forEach(({ fileUri }) => {
    workspaceEdit.createFile(fileUri);
  });

  // If any of the files to create exists, ask user if he wants to overwrite them.
  if (filesThatExist.length) {
    const actionSelected = await vscode.window.showInformationMessage(
      filesThatExist.length === 1
        ? `The file '${filesThatExist[0].fileUri.path}' already exists. Do you want to overwrite it?`
        : `The files '${filesThatExist.map((file) => file.fileUri.path).join(', ')}' already exist. Do you want to overwrite them?`,
      filesThatExist.length === 1
        ? OVERWRITE_SINGLE_FILE_ACTION
        : OVERWRITE_MULTIPLE_FILES_ACTION,
    );

    switch (actionSelected) {
      // If the user clicks the overwrite action, open each file to empty them.
      case OVERWRITE_MULTIPLE_FILES_ACTION:
      case OVERWRITE_SINGLE_FILE_ACTION: {
        await Promise.all(filesThatExist.map(async ({ fileUri }): Promise<void> => {
          const fileDocument = await vscode.workspace.openTextDocument(fileUri);

          workspaceEdit.delete(
            fileUri,
            new vscode.Range(
              fileDocument.lineAt(0).range.start,
              fileDocument.lineAt(fileDocument.lineCount - 1).range.end,
            ),
          );
        }));
        break;
      }

      // If the user dismisses the message, abort.
      default:
        return;
    }
  }

  // Generate and write the file contents.
  await Promise.all(filesToRender.map(async ({ template, fileUri }) => {
    // Use the template to generate the file content using ejs.
    const fileContent = await ejs.render(
      new TextDecoder('utf-8').decode(template.content),
      {
        baseFileName,
      },
      { async: true },
    );

    // Write the file content in the file.
    workspaceEdit.insert(fileUri, new vscode.Position(0, 0), fileContent);
  }));

  // Apply all creations / edits.
  await vscode.workspace.applyEdit(workspaceEdit);

  // Show the last created file.
  await vscode.window.showTextDocument(filesToRender[filesToRender.length - 1].fileUri);
};
