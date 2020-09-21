import { QuickPickItem, workspace, WorkspaceFolder } from 'vscode';

import { FolderType } from '../../domain/config/types';

export interface FolderQuickPickItem extends QuickPickItem {
  folderType: FolderType;
}

export interface WorkspaceFolderQuickPickItem extends FolderQuickPickItem {
  workspaceFolder: WorkspaceFolder;
}

/**
 * Get a list of all available options to store the template.
 */
export const getFoldersQuickPickItems = (
  globalFolderName: string,
  globalFolderDescription: string,
  workspaceFolderDescription: string,
): FolderQuickPickItem[] => [
  {
    folderType: FolderType.Global,
    label: globalFolderName,
    description: globalFolderDescription,
  },

  ...(workspace.workspaceFolders || []).map(
    (workspaceFolder): WorkspaceFolderQuickPickItem => ({
      workspaceFolder,
      folderType: FolderType.WorkspaceFolder,
      label: workspaceFolder.name,
      description: workspaceFolderDescription,
    }),
  ),
];

/**
 * Get a list of all available options where to create the template.
 */
export const getCreateTemplateFoldersQuickPickItems = (): FolderQuickPickItem[] => (
  getFoldersQuickPickItems(
    'Global file template',
    'The file template will be available in all your projects.',
    'The file template will be saved and only available in this folder. Useful to share with other members of the project.',
  )
);

/**
 * Get a list of all available options where to find the template the edit.
 */
export const getTemplateFoldersQuickPickItems = (): FolderQuickPickItem[] => (
  getFoldersQuickPickItems(
    'Global file template',
    'File templates available in all your projects.',
    'File templates saved locally in this folder.',
  )
);

/**
 * Get a list of all available options where to create the template.
 */
export const getCreateTemplateGroupFoldersQuickPickItems = (): FolderQuickPickItem[] => (
  getFoldersQuickPickItems(
    'Global file template group',
    'The file template group will be available in all your projects.',
    'The file template group will be saved and only available in this folder. Useful to share with other members of the project.',
  )
);

/**
 * Get a list of all available options where to find the template the edit.
 */
export const getTemplateGroupFoldersQuickPickItems = (): FolderQuickPickItem[] => (
  getFoldersQuickPickItems(
    'Global file template',
    'File template groups available in all your projects.',
    'File template groups saved locally in this folder.',
  )
);
