import { QuickPickItem, Uri, window } from 'vscode';

import { FolderType } from '../../domain/config/types';
import { Template } from '../../domain/templates/data/template';
import { findInvalidVarNamePattern } from '../../domain/templates/data/template/utils';
import { templatesService } from '../../domain/templates/services';
import { BooleanQuickPickItem } from './common';
import { FolderQuickPickItem, WorkspaceFolderQuickPickItem } from './folders';

/** Add the template object to the quick pick items so it's easier to use. */
export interface TemplateQuickPickItem extends QuickPickItem {
  template: Template;
}

/**
 * Map a template to a quick pick item.
 * The template is in the item.
 *
 * @param template - Template to map.
 */
export function mapTemplateToQuickPickItem(template: Template): TemplateQuickPickItem {
  return {
    template,
    label: template.metadata.name,
    detail: template.metadata.fileTemplateName,
    description: template.folderConfiguration.folderType === FolderType.WorkspaceFolder
      ? 'Local template'
      : 'Global template',
  };
}

/**
 * Map templates to a quick pick options.
 *
 * @param templates - Templates to map.
 * @param showOnlyAsPartOfGroup - Include templates that are only as part of a group.
 * @param showDisabled - Include disabled templates.
 */
export function mapTemplatesToQuickPickItems(
  templates: readonly Template[],
  showOnlyAsPartOfGroup = false,
  showDisabled = false,
): TemplateQuickPickItem[] {
  return templates
    .filter((template) => (
      (showOnlyAsPartOfGroup || !template.metadata.onlyAsPartOfGroup)
      && (showDisabled || !template.metadata.disabled)
    ))
    .map((template) => mapTemplateToQuickPickItem(template));
}

/**
 * Helper function to load templates of a workspace folder before mapping them to quick pick items.
 *
 * @param workspaceFolderUri - Workspace folder uri where to find the templates.
 * @param showOnlyAsPartOfGroup - Include templates that are only as part of a group.
 * @param showDisabled - Include disabled templates.
 */
export async function getTemplatesOfWorkspaceFolderQuickPickItems(
  workspaceFolderUri: Uri,
  showOnlyAsPartOfGroup?: boolean,
  showDisabled?: boolean,
): Promise<TemplateQuickPickItem[]> {
  const templates = await templatesService.getTemplatesOfWorkspaceFolder(workspaceFolderUri);
  return mapTemplatesToQuickPickItems(templates, showOnlyAsPartOfGroup, showDisabled);
}

/**
 * Helper function to load global templates before mapping them to quick pick items.
 *
 * @param showOnlyAsPartOfGroup - Include templates that are only as part of a group.
 * @param showDisabled - Include disabled templates.
 */
export async function getGlobalTemplatesQuickPickItems(
  showOnlyAsPartOfGroup?: boolean,
  showDisabled?: boolean,
): Promise<TemplateQuickPickItem[]> {
  const templates = await templatesService.getGlobalTemplates();
  return mapTemplatesToQuickPickItems(templates, showOnlyAsPartOfGroup, showDisabled);
}

export async function getTemplateQuickPickItemsOfSelectedFolder(
  selectedFolderItem: FolderQuickPickItem,
  showOnlyAsPartOfGroup?: boolean,
  showDisabled?: boolean,
): Promise<TemplateQuickPickItem[]> {
  return selectedFolderItem.folderType === FolderType.Global
    ? getGlobalTemplatesQuickPickItems(showOnlyAsPartOfGroup, showDisabled)
    : getTemplatesOfWorkspaceFolderQuickPickItems(
      (selectedFolderItem as WorkspaceFolderQuickPickItem).workspaceFolder.uri,
      showOnlyAsPartOfGroup,
      showDisabled,
    );
}

export async function showTemplateNameInputBox(value?: string): Promise<string | undefined> {
  const name = await window.showInputBox({
    value,
    valueSelection: value ? [0, value.length] : undefined,
    prompt: 'Give a name to your file template.',
    placeHolder: 'React component',
    validateInput: (input) => (!input.trim() ? 'This is required.' : null),
  });

  return name;
}

export async function showFileTemplateNameInputBox(value?: string): Promise<string | undefined> {
  const fileTemplateName = await window.showInputBox({
    value,
    valueSelection: value ? [0, value.length] : undefined,
    prompt: 'Template file name. Read the docs for more information on variables in file names.',
    placeHolder: '{{name}}.jsx',
    validateInput: (input) => {
      if (!input.trim()) {
        return 'This is required.';
      }

      const invalidVarPattern = findInvalidVarNamePattern(input);
      if (invalidVarPattern) {
        return `'${invalidVarPattern}' is not a valid JavaScript variable name.`;
      }

      return null;
    },
  });

  return fileTemplateName;
}

export async function showOnlyAsPartOfGroupQuickPick()
: Promise<BooleanQuickPickItem | undefined> {
  const onlyAsPartOfGroupItem = await window.showQuickPick(
    [
      {
        value: false,
        label: 'Yes',
        detail: "This file template can be used by itself. If you're not sure, this is probably the option you want.",
      },
      {
        value: true,
        label: 'No',
        detail: 'This file template can only be used as part of a file template group.',
      },
    ],
    {
      placeHolder: 'Does your file template have value outside of a file template group?',
    },
  );

  return onlyAsPartOfGroupItem;
}
