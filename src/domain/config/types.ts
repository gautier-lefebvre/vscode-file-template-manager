export enum FolderType {
  WorkspaceFolder = 'WORKSPACE_FOLDER',
  Global = 'GLOBAL'
}

export type FolderConfigurationVariables = { [key: string]: unknown };

export interface FolderConfiguration {
  /** Relative path to the folder containing the templates of the current project. */
  templatesFolderPath: string;

  /** Whether the configuration represents the global folder of a workspace folder. */
  folderType: FolderType;

  /** Key-value dictionary of variables (global or relative to workspace folder configuration). */
  variables: FolderConfigurationVariables;
}

export interface RawFolderConfiguration {
  /** Key-value dictionary of variables (global or relative to workspace folder configuration). */
  variables?: FolderConfigurationVariables;
}

export interface RawWorkspaceFolderConfiguration extends RawFolderConfiguration {
  /** Path to the folder containing the templates of the current workspace folder. */
  templatesFolderPath?: string;
}
