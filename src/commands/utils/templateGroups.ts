import {
  commands,
  QuickPickItem,
  Uri,
  window,
} from 'vscode';

import { COMMANDS } from '../../constants';
import { FolderType } from '../../domain/config/types';
import { TemplateRenderer } from '../../domain/renderer/templateRenderer';
import { Template } from '../../domain/templates/data/template';
import { getAllDistinctVarNames, getVariablesInsideTemplate, TemplateGroupVariableValues } from '../../domain/templates/data/template/utils';
import { TemplateGroup } from '../../domain/templates/data/templateGoup';
import { templatesService } from '../../domain/templates/services';

import { BooleanQuickPickItem } from './common';
import { FolderQuickPickItem, WorkspaceFolderQuickPickItem } from './folders';

/** Add the template object to the quick pick items so it's easier to use. */
export interface TemplateGroupQuickPickItem extends QuickPickItem {
  templateGroup: TemplateGroup;
}

/**
 * Map a template group to a quick pick item.
 * The template group is in the item.
 *
 * @param templateGroup - Template group to map.
 */
export function mapTemplateGroupToQuickPickItem(templateGroup: TemplateGroup)
  : TemplateGroupQuickPickItem {
  return {
    templateGroup,
    label: templateGroup.metadata.name,
    description: templateGroup.folderConfiguration.folderType === FolderType.WorkspaceFolder
      ? 'Local template group'
      : 'Global template group',
  };
}

/**
 * Map template groups to a quick pick options.
 *
 * @param templateGroups - Template groups to map.
 * @param showDisabled - Include disabled template groups.
 */
export function mapTemplateGroupsToQuickPickItems(
  templateGroups: readonly TemplateGroup[],
  showDisabled = false,
): TemplateGroupQuickPickItem[] {
  return templateGroups
    .filter((templateGroup) => (showDisabled || !templateGroup.metadata.disabled))
    .map((templateGroup) => mapTemplateGroupToQuickPickItem(templateGroup));
}

/**
 * Helper function to load templates of a workspace folder before mapping them to quick pick items.
 *
 * @param workspaceFolderUri - Workspace folder uri where to find the template groups.
 * @param showDisabled - Include disabled template groups.
 */
export async function getTemplateGroupsOfWorkspaceFolderQuickPickItems(
  workspaceFolderUri: Uri,
  showDisabled?: boolean,
): Promise<TemplateGroupQuickPickItem[]> {
  const templateGroups = await templatesService.getTemplateGroupsOfWorkspaceFolder(
    workspaceFolderUri,
  );

  return mapTemplateGroupsToQuickPickItems(templateGroups, showDisabled);
}

/**
 * Helper function to load global template groups before mapping them to quick pick items.
 *
 * @param showDisabled - Include disabled template groups.
 */
export async function getGlobalTemplateGroupsQuickPickItems(
  showDisabled?: boolean,
): Promise<TemplateGroupQuickPickItem[]> {
  const templateGroups = await templatesService.getGlobalTemplateGroups();
  return mapTemplateGroupsToQuickPickItems(templateGroups, showDisabled);
}

export async function getTemplateGroupQuickPickItemsOfSelectedFolder(
  selectedFolderItem: FolderQuickPickItem,
  showDisabled?: boolean,
): Promise<TemplateGroupQuickPickItem[]> {
  return selectedFolderItem.folderType === FolderType.Global
    ? getGlobalTemplateGroupsQuickPickItems(showDisabled)
    : getTemplateGroupsOfWorkspaceFolderQuickPickItems(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      showDisabled,
    );
}

export async function showTemplateGroupNameInputBox(value?: string): Promise<string | undefined> {
  const name = await window.showInputBox({
    value,
    valueSelection: value ? [0, value.length] : undefined,
    prompt: 'Give a name to your file template group.',
    placeHolder: 'React component group',
    validateInput: (input) => (!input.trim() ? 'This is required.' : null),
  });

  return name;
}

export async function showTemplatesUseSameVariablesQuickPick()
: Promise<BooleanQuickPickItem | undefined> {
  const templatesUseSameVariablesItem = await window.showQuickPick(
    [
      {
        value: true,
        label: 'Yes',
        detail: 'You will only be prompted once per distinct variable in your templates file names.',
      },
      {
        value: false,
        label: 'No',
        detail: 'You will be prompted for each variable in each template file name.',
      },
    ],
    {
      placeHolder: 'Do all the file templates of this group share their file name variables?',
    },
  );

  return templatesUseSameVariablesItem;
}

export async function askUserToCreateTemplate(
  selectedFolderItem: FolderQuickPickItem,
): Promise<Template | undefined> {
  const CREATE_TEMPLATE_ACTION = 'Create a new file template';

  const actionSelected = await window.showInformationMessage(
    'You do not have any file template in this folder. Do you want to create one instead? It will be added to your file template group.',
    CREATE_TEMPLATE_ACTION,
  );

  if (actionSelected === CREATE_TEMPLATE_ACTION) {
    const createdTemplate: Template | undefined = await commands.executeCommand(
      COMMANDS.CREATE_TEMPLATE,
      selectedFolderItem,
    );

    return createdTemplate;
  }

  return undefined;
}

export async function askUserToCreateTemplateGroup(
  selectedFolderItem: FolderQuickPickItem,
): Promise<TemplateGroup | undefined> {
  const CREATE_TEMPLATE_GROUP_ACTION = 'Create a new file template group';

  const actionSelected = await window.showInformationMessage(
    'You do not have any file template group in this folder. Do you want to create one instead?',
    CREATE_TEMPLATE_GROUP_ACTION,
  );

  if (actionSelected === CREATE_TEMPLATE_GROUP_ACTION) {
    const templateGroup: TemplateGroup | undefined = await commands.executeCommand(
      COMMANDS.CREATE_TEMPLATE_GROUP,
      selectedFolderItem,
    );

    return templateGroup;
  }

  return undefined;
}

export async function promptUserForTemplatesVariablesValues(
  templatesUseSameVariables: boolean,
  templateRenderers: TemplateRenderer[],
  baseFolderUri: Uri,
): Promise<TemplateGroupVariableValues | undefined> {
  const variablesInTemplateNames = (
    templateRenderers.reduce(
      (acc: { [templateId: string]: string[] }, templateRenderer) => {
        acc[templateRenderer.template.metadata.id] = getAllDistinctVarNames(
          templateRenderer.template.metadata.fileTemplateName,
        );
        return acc;
      },
      {},
    )
  );

  const variablesValues = (
    templateRenderers.reduce(
      (acc: TemplateGroupVariableValues, templateRenderer) => {
        acc[templateRenderer.template.metadata.id] = {};
        return acc;
      },
      {},
    )
  );

  /* Get all variables inside template file names. */
  for (let i = 0; i < templateRenderers.length; ++i) {
    const templateRenderer = templateRenderers[i];
    const varNames = variablesInTemplateNames[templateRenderer.template.metadata.id];

    for (let j = 0; j < varNames.length; ++j) {
      const varName = varNames[j];

      const value = variablesValues[templateRenderer.template.metadata.id][varName];

      if (value !== undefined) { continue; }

      const templatesVariableUsage = templateRenderers.map((t) => ({
        templateRenderer: t,
        usesVariable: variablesInTemplateNames[t.template.metadata.id].includes(varName),
      }));

      const fileTemplateNames = !templatesUseSameVariables
        ? [templateRenderer.template.metadata.fileTemplateName]
        : templatesVariableUsage
          .filter(({ usesVariable }) => !!usesVariable)
          .map(({ templateRenderer: { template } }) => template.metadata.fileTemplateName);

      const variableValue = await window.showInputBox({
        placeHolder: `What is the value of '${varName}'?`,
        prompt: `'${varName}' in ${fileTemplateNames.join(', ')}?`,
      });

      if (variableValue === undefined) { return undefined; }

      if (templatesUseSameVariables) {
        /* Add variable to all templates. */
        templateRenderers.forEach(({ template: { metadata: { id } } }) => {
          variablesValues[id][varName] = variableValue;
        });
      } else {
        /*
         * Add variable to current template,
         * and any template who do not use the variable in their name.
         *
         * NB: this is done for retrocompatibility. A more logical way would be to ignore other
         * templates, and prompt them independently based on their content.
         */
        variablesValues[templateRenderer.template.metadata.id][varName] = variableValue;

        templatesVariableUsage
          .filter(({ usesVariable }) => !usesVariable)
          .forEach(({ templateRenderer: { template: { metadata: { id } } } }) => {
            variablesValues[id][varName] = variableValue;
          });
      }
    }
  }

  const variablesInsideTemplates = (
    await Promise.all(templateRenderers.map(async (templateRenderer) => ({
      templateRenderer,
      variables: await getVariablesInsideTemplate(
        baseFolderUri,
        templateRenderer,
        variablesValues[templateRenderer.template.metadata.id],
        templateRenderers.map(({ template }) => template),
      ),
    })))
  ).reduce(
    (acc: { [key:string]: string[] }, { templateRenderer, variables }) => {
      acc[templateRenderer.template.metadata.id] = variables;
      return acc;
    },
    {},
  );

  /* Prompt any variable in templates that is not already defined. */
  /* If templates uses the same variables, prompt once per variable. */
  /* Otherwise prompt for each file independently. */
  for (let i = 0; i < templateRenderers.length; ++i) {
    const templateRenderer = templateRenderers[i];
    const varNames = variablesInsideTemplates[templateRenderer.template.metadata.id];

    for (let j = 0; j < varNames.length; ++j) {
      const varName = varNames[j];

      const value = variablesValues[templateRenderer.template.metadata.id][varName];

      if (value !== undefined) { continue; }

      const templatesUsingVariable = !templatesUseSameVariables
        ? [templateRenderer.template.metadata.name]
        : templateRenderers
          .filter((t) => variablesInsideTemplates[t.template.metadata.id].includes(varName))
          .map((t) => t.template.metadata.name);

      const variableValue = await window.showInputBox({
        placeHolder: `What is the value of '${varName}'?`,
        prompt: `'${varName}' inside content of ${templatesUsingVariable.length > 1 ? 'templates' : 'template'} ${templatesUsingVariable.map((name) => `'${name}'`).join(', ')}?`,
      });

      if (variableValue === undefined) { return undefined; }

      if (templatesUseSameVariables) {
        /* Add variable to all templates. */
        templateRenderers.forEach(({ template: { metadata: { id } } }) => {
          variablesValues[id][varName] = variableValue;
        });
      } else {
        /* Add variable to current template only. */
        variablesValues[templateRenderer.template.metadata.id][varName] = variableValue;
      }
    }
  }

  return variablesValues;
}
