import { Uri, window } from 'vscode';
import { cosmiconfig } from 'cosmiconfig';

import { logger } from '../../services/logger';
import { getExtensionContext } from '../../services/extensionContext';
import { CONFIG_FILE_MODULE_NAME, DEFAULT_TEMPLATES_FOLDER } from '../../constants';
import {
  FolderConfiguration,
  FolderType,
  RawFolderConfiguration,
  RawWorkspaceFolderConfiguration,
} from './types';

const configurationFileExplorer = cosmiconfig(
  CONFIG_FILE_MODULE_NAME,
  { cache: false },
);

async function readConfiguration<T extends RawFolderConfiguration>(folderUri: Uri)
  :Promise<T> {
  const { config } = await configurationFileExplorer.search(folderUri.fsPath) || {};
  return config || {} as T;
}

export async function getWorkspaceFolderConfiguration(workspaceFolderUri: Uri)
  : Promise<FolderConfiguration> {
  let config;
  try {
    config = await readConfiguration<RawWorkspaceFolderConfiguration>(workspaceFolderUri);
  } catch (err) {
    logger.appendLine(err);
    window.showWarningMessage(`Could not load configuration for folder '${workspaceFolderUri.path}'. Default configuration will be used instead.`);

    config = {} as RawWorkspaceFolderConfiguration;
  }

  const {
    variables,
    templatesFolderPath,
  } = config;

  return {
    folderType: FolderType.WorkspaceFolder,
    templatesFolderPath: templatesFolderPath || DEFAULT_TEMPLATES_FOLDER,
    variables: variables || {},
  };
}

export async function getGlobalFolderConfiguration(): Promise<FolderConfiguration> {
  let config;
  try {
    const { globalStorageUri } = getExtensionContext();
    config = await readConfiguration<RawFolderConfiguration>(globalStorageUri);
  } catch (err) {
    logger.appendLine(err);
    window.showWarningMessage('Could not load global templates configuration. Default configuration will be used instead.');

    config = {} as RawFolderConfiguration;
  }

  const {
    variables,
  } = config;

  return {
    folderType: FolderType.Global,
    templatesFolderPath: DEFAULT_TEMPLATES_FOLDER,
    variables: variables || {},
  };
}
