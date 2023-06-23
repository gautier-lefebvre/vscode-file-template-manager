import { Uri, workspace } from 'vscode';
import escapeStringRegexp from 'escape-string-regexp';

import { TextDecoder } from 'util';
import { validVariableName } from '../../../../constants';
import { Template } from './index';
import { compileTemplate, renderFileContent } from '../../../renderer';

export type TemplateVariableValues = {
  [varName: string]: string,
};

export type TemplateGroupVariableValues = {
  [templateId: string]: TemplateVariableValues,
};

/**
 * Get all distinct var names in the file template name.
 *
 * @param fileTemplateName - File template name. E.g {{name}}.{{suffix}}.js.
 * @returns The variable names. E.g. ['name', 'suffix'].
 */
export const getAllDistinctVarNames = (fileTemplateName: string): string[] => {
  let match;
  const varNamesRegex = /\{\{([^{}]+)\}\}/g;
  const varNames = new Set<string>();

  // eslint-disable-next-line no-cond-assign
  while ((match = varNamesRegex.exec(fileTemplateName)) !== null) {
    varNames.add(match[1]);
  }

  return [...varNames];
};

/**
 * Find the first invalid {{varName}} pattern in the input, and returns varName if found.
 *
 * @param fileTemplateName - Input.
 * @returns The first invalid name found.
 */
export const findInvalidVarNamePattern = (fileTemplateName: string): string | undefined => (
  getAllDistinctVarNames(fileTemplateName)
    .find((varName) => !validVariableName.test(varName))
);

/**
 * Generate the actual file name by resolving {{varName}} patterns.
 * Any varName not in the values map will be left as-is.
 *
 * @param fileTemplateName - File template name. E.g. {{name}}.{{suffix}}.js
 * @param values - Map of vars. E.g. { name: 'foo', suffix: 'bar' }.
 * @returns The generated file name. E.g. foo.bar.js.
 */
export const generateFileName = (
  fileTemplateName: string,
  values: TemplateVariableValues,
): string => (
  Object.keys(values)
    .reduce(
      (acc, key) => acc.replace(
        new RegExp(
          escapeStringRegexp(`{{${key}}}`),
          'g',
        ),
        values[key],
      ),
      fileTemplateName,
    )
);

export const generateFileUri = (
  baseFolderUri: Uri,
  fileTemplateName: Template['metadata']['fileTemplateName'],
  fileNameVariables: { [key: string]: string },
): Uri => Uri.joinPath(
  baseFolderUri,
  generateFileName(fileTemplateName, fileNameVariables),
);

/**
 * Return name of variables inside the template content.
 * This might be slow because we need to try/catch around ejs.render to get missing variables.
 *
 * @param baseFolderUri - Base folder URI of the command.
 * @param template - Template.
 * @param templateFileNameVariables - Name of variables inside the template file name.
 * @param groupTemplates - Templates inside the group.
 * @returns Name of variables inside the template content.
 */
export const getVariablesInsideTemplate = async (
  baseFolderUri: Uri,
  template: Template,
  templateFileNameVariables: { [key: string]: string },
  groupTemplates: Template[],
): Promise<string[]> => {
  const fileUri = generateFileUri(
    baseFolderUri,
    template.metadata.fileTemplateName,
    templateFileNameVariables,
  );

  const workspaceFolder = workspace.getWorkspaceFolder(fileUri);

  if (!workspaceFolder) {
    throw Error('Cannot create files outside of a workspace folder.');
  }

  const templateFunction = compileTemplate(
    new TextDecoder('utf-8')
      .decode(await workspace.fs.readFile(template.contentFileUri)),
  );

  const fakeVariablesInTemplateContent: { [key: string]: string} = {};

  let missingVariableName: string | undefined;
  do {
    try {
      await renderFileContent(
        fileUri,
        templateFunction,
        {
          ...templateFileNameVariables,
          ...fakeVariablesInTemplateContent,
        },
        groupTemplates,
      );

      missingVariableName = undefined;
    } catch (err) {
      if (err instanceof ReferenceError) {
        const matchResult = err.message.match(/(\w+) is not defined/);

        if (matchResult && matchResult[1]) {
          [, missingVariableName] = matchResult;
          fakeVariablesInTemplateContent[missingVariableName] = 'placeholderValue';

          continue;
        }
      }

      throw err;
    }
  } while (missingVariableName);

  return Object.keys(fakeVariablesInTemplateContent);
};
