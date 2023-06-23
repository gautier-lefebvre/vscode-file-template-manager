import { TextDecoder, TextEncoder } from 'util';
import { basename } from 'path';

import { Uri, workspace } from 'vscode';
import ejs from 'ejs';

import { config } from '../config';
import { Template } from '../templates/data/template';

export const compileTemplate = (templateContent: string): ejs.AsyncTemplateFunction => ejs.compile(
  templateContent,
  { async: true },
);

export const renderFileContent = async (
  fileUri: Uri,
  templateFunction: ejs.AsyncTemplateFunction,
  /* Variables inside template title and content. */
  templateVariables: ejs.Data,
  groupTemplates: Template[],
): Promise<string> => {
  const workspaceFolder = workspace.getWorkspaceFolder(fileUri);

  if (!workspaceFolder) {
    throw Error('Cannot create files outside of a workspace folder.');
  }

  const [
    globalConfiguration,
    workspaceFolderConfiguration,
  ] = await Promise.all([
    config.getGlobalFolderConfiguration(),
    config.getWorkspaceFolderConfiguration(workspaceFolder.uri),
  ]);

  const variables = {
    ...globalConfiguration.variables,
    ...workspaceFolderConfiguration.variables,
    ...templateVariables,

    groupTemplates: groupTemplates.map(({ metadata: { name } }) => name),
    timestamp: new Date().toISOString(),
    relativeFilePath: workspace.asRelativePath(fileUri, false),
    fileName: basename(fileUri.path),
    baseFileName: basename(fileUri.path).split('.')[0],
  };

  return templateFunction(variables);
};

/**
 * Render a file.
 * Make sure that the file does not exist or can be overwritten before calling this method.
 */
export const renderFile = async (
  fileUri: Uri,
  template: Template,
  templateVariables: ejs.Data,
  groupTemplates: Template[] = [],
): Promise<void> => {
  const templateContent = await workspace.fs.readFile(template.contentFileUri);

  const generatedFileContent = await renderFileContent(
    fileUri,
    compileTemplate(new TextDecoder('utf-8').decode(templateContent)),
    templateVariables,
    groupTemplates,
  );

  await workspace.fs.writeFile(
    fileUri,
    new TextEncoder().encode(generatedFileContent),
  );
};
