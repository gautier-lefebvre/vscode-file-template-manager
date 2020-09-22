import { cosmiconfig } from 'cosmiconfig';
import {
  Disposable,
  Uri,
  window,
  workspace,
} from 'vscode';

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

type FileCache = {
  filePath: string,
  mtime: number,
  folderConfiguration: FolderConfiguration,
};

class ConfigurationService {
  private workspaceFoldersCache: { [folderPath: string]: FileCache } = {};

  private globalFolderCache: FileCache | null = null;

  private workspaceFoldersWatcher: Disposable | null = null;

  public watch() {
    this.workspaceFoldersWatcher?.dispose();
    this.workspaceFoldersWatcher = workspace.onDidChangeWorkspaceFolders(
      ({ removed }) => {
        removed.forEach((workspaceFolder) => {
          delete this.workspaceFoldersCache[workspaceFolder.uri.path];
        });
      },
    );
  }

  public dispose() {
    this.workspaceFoldersWatcher?.dispose();
    this.workspaceFoldersWatcher = null;
  }

  public async getWorkspaceFolderConfiguration(workspaceFolderUri: Uri)
    : Promise<FolderConfiguration> {
    let config;
    let filePath;
    try {
      const cachedConfiguration = await this.useCache(
        this.workspaceFoldersCache[workspaceFolderUri.path],
        () => { delete this.workspaceFoldersCache[workspaceFolderUri.path]; },
      );

      if (cachedConfiguration) { return cachedConfiguration; }

      ({
        config,
        filePath,
      } = await this.readConfiguration<RawWorkspaceFolderConfiguration>(workspaceFolderUri));
    } catch (err) {
      logger.appendLine(err);
      window.showWarningMessage(`Could not load configuration for folder '${workspaceFolderUri.path}'. Default configuration will be used instead.`);

      config = {} as RawWorkspaceFolderConfiguration;
    }

    const {
      variables,
      templatesFolderPath,
    } = config;

    const folderConfiguration = {
      folderType: FolderType.WorkspaceFolder,
      templatesFolderPath: templatesFolderPath || DEFAULT_TEMPLATES_FOLDER,
      variables: variables || {},
    };

    this.saveCache(
      filePath,
      folderConfiguration,
      (fileCache) => { this.workspaceFoldersCache[workspaceFolderUri.path] = fileCache; },
    );

    return folderConfiguration;
  }

  public async getGlobalFolderConfiguration(): Promise<FolderConfiguration> {
    let config;
    let filePath;
    try {
      const cachedConfiguration = await this.useCache(
        this.globalFolderCache,
        () => { this.globalFolderCache = null; },
      );

      if (cachedConfiguration) { return cachedConfiguration; }

      const { globalStorageUri } = getExtensionContext();

      ({
        config,
        filePath,
      } = await this.readConfiguration<RawFolderConfiguration>(globalStorageUri));
    } catch (err) {
      logger.appendLine(err);
      window.showWarningMessage('Could not load global templates configuration. Default configuration will be used instead.');

      config = {} as RawFolderConfiguration;
    }

    const {
      variables,
    } = config;

    const folderConfiguration = {
      folderType: FolderType.Global,
      templatesFolderPath: DEFAULT_TEMPLATES_FOLDER,
      variables: variables || {},
    };

    this.saveCache(
      filePath,
      folderConfiguration,
      (fileCache) => { this.globalFolderCache = fileCache; },
    );

    return folderConfiguration;
  }

  private async useCache(
    fileCache: FileCache | null | undefined,
    clearCache: () => void,
  ): Promise<FolderConfiguration | null> {
    if (fileCache) {
      try {
        const fileStat = await workspace.fs.stat(Uri.file(fileCache.filePath));

        if (fileStat.mtime === fileCache.mtime) {
          return fileCache.folderConfiguration;
        }

        clearCache();
      } catch (err) {
        clearCache();
        if (err.code !== 'FileNotFound') { throw err; }
      }
    }

    return null;
  }

  private async saveCache(
    filePath: string | undefined,
    folderConfiguration: FolderConfiguration,
    saveCache: (fileCache: FileCache) => void,
  ): Promise<void> {
    if (filePath) {
      try {
        const fileStat = await workspace.fs.stat(Uri.file(filePath));

        saveCache({
          filePath,
          mtime: fileStat.mtime,
          folderConfiguration,
        });
      } catch (err) {
        logger.appendLine(err);
      }
    }
  }

  private async readConfiguration<T extends RawFolderConfiguration>(folderUri: Uri)
    :Promise<{ filePath: string | undefined, config: T }> {
    const { config, filepath } = await configurationFileExplorer.search(folderUri.fsPath) || {};
    return {
      filePath: filepath,
      config: config || {} as T,
    };
  }
}

export const config = new ConfigurationService();
