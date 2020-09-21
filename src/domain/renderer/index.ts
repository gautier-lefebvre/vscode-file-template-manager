import { TextDecoder, TextEncoder } from 'util';
import { basename, extname } from 'path';

import { Uri, workspace } from 'vscode';
import ejs from 'ejs';

import { getGlobalFolderConfiguration, getWorkspaceFolderConfiguration } from '../config';
import { Template } from '../templates/data/template';

/**
 * Render a file.
 * Make sure that the file does not exist or can be overwritten before calling this method.
 */
export const renderFile = async (
  fileUri: Uri,
  template: Template,
  fileNameVariables: { [key: string]: string },
): Promise<void> => {
  const workspaceFolder = workspace.getWorkspaceFolder(fileUri);

  if (!workspaceFolder) {
    throw Error('Cannot create files outside of a workspace folder.');
  }

  const [
    globalConfiguration,
    workspaceFolderConfiguration,
    templateContent,
  ] = await Promise.all([
    getGlobalFolderConfiguration(),
    getWorkspaceFolderConfiguration(workspaceFolder.uri),
    workspace.fs.readFile(template.contentFileUri),
  ]);

  const variables = {
    ...globalConfiguration.variables,
    ...workspaceFolderConfiguration.variables,
    ...fileNameVariables,

    timestamp: new Date().toISOString(),
    relativeFilePath: workspace.asRelativePath(fileUri, false),
    fileName: basename(fileUri.path),
    baseFileName: basename(fileUri.path, extname(fileUri.path)),
  };

  const generatedFileContent = await ejs.render(
    new TextDecoder('utf-8').decode(templateContent),
    variables,
    { async: true },
  );

  await workspace.fs.writeFile(
    fileUri,
    new TextEncoder().encode(generatedFileContent),
  );
};
