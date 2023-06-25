import { basename } from 'path';
import { TextDecoder, TextEncoder } from 'util';

import ejs from 'ejs';
import { Uri, workspace } from 'vscode';

import { config } from '../config';
import { Template } from '../templates/data/template';

import { MissingVariableError } from './missingVariableError';

/**
 * Do not cache this class, the template content might change between commands.
 */
export class TemplateRenderer {
  public readonly template: Template;

  private compiledTemplate: ejs.AsyncTemplateFunction | null = null;

  constructor(template: Template) {
    this.template = template;
  }

  /**
   * Reset the compiled template.
   */
  public reset(): void {
    this.compiledTemplate = null;
  }

  /**
   * Get the list of variables to render.
   *
   * @param fileUri - File uri.
   * @param templateVariables - Variables in the template name and content.
   * @param groupTemplates - Other templates inside the group being rendered.
   * @returns Variables to pass to the template.
   */
  private async getVariablesForRender(
    fileUri: Uri,
    templateVariables: ejs.Data,
    groupTemplates: Template[],
  ): Promise<ejs.Data> {
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

    return {
      ...globalConfiguration.variables,
      ...workspaceFolderConfiguration.variables,
      ...templateVariables,

      groupTemplates: groupTemplates.map(({ metadata: { name } }) => name),
      timestamp: new Date().toISOString(),
      relativeFilePath: workspace.asRelativePath(fileUri, false),
      fileName: basename(fileUri.path),
      baseFileName: basename(fileUri.path).split('.')[0],
    };
  }

  /**
   * Try to render the template.
   * Throw MissingVariableError if a variable inside a template is not provided.
   *
   * @param fileUri - File uri.
   * @param templateVariables - Variables in the template name and content.
   * @param groupTemplates - Other templates inside the group being rendered.
   * @returns Rendered file content.
   */
  public async renderTemplate(
    fileUri: Uri,
    templateVariables: ejs.Data,
    groupTemplates: Template[],
  ): Promise<string> {
    if (!this.compiledTemplate) {
      this.compiledTemplate = ejs.compile(
        new TextDecoder('utf-8').decode(await workspace.fs.readFile(this.template.contentFileUri)),
        { async: true },
      );
    }

    const variables = await this.getVariablesForRender(
      fileUri,
      templateVariables,
      groupTemplates,
    );

    try {
      return await this.compiledTemplate(variables);
    } catch (err) {
      if (err instanceof ReferenceError) {
        throw new MissingVariableError(err);
      }

      throw err;
    }
  }

  /**
   * Render the template to a file.
   * Throw MissingVariableError if a variable inside a template is not provided.
   *
   * @param fileUri - File uri.
   * @param templateVariables - Variables in the template name and content.
   * @param groupTemplates - Other templates inside the group being rendered.
   */
  public async renderToFile(
    fileUri: Uri,
    templateVariables: ejs.Data,
    groupTemplates: Template[],
  ): Promise<void> {
    await workspace.fs.writeFile(
      fileUri,
      new TextEncoder().encode(await this.renderTemplate(
        fileUri,
        templateVariables,
        groupTemplates,
      )),
    );
  }
}
