import { window } from 'vscode';

import { config } from '../domain/config';

export const editWorkspaceFolderConfiguration = async (): Promise<void> => {
  const workspaceFolder = await window.showWorkspaceFolderPick({
    placeHolder: 'Edit the configuration of which folder?',
  });

  if (!workspaceFolder) { return; }

  const fileUri = await config.getWorkspaceFolderConfigurationFilePath(workspaceFolder.uri);

  await window.showTextDocument(fileUri);
};
