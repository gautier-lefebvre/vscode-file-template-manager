import { window } from 'vscode';

import { config } from '../domain/config';

export const editGlobalConfiguration = async (): Promise<void> => {
  const uri = await config.getGlobalFolderConfigurationFilePath();

  await window.showTextDocument(uri);
};
