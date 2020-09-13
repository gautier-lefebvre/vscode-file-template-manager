import * as vscode from 'vscode';

import { FTM_FS_SCHEME } from './config/constants';
import { setExtensionContext } from './domain/templates';
import FileTemplateManagerFileSystemProvider from './domain/fileSystemProvider';

import createNewFileTemplate from './commands/createNewFileTemplate';
import editFileTemplate from './commands/editFileTemplate';
import removeFileTemplate from './commands/removeFileTemplate';
import createNewFileFromTemplate from './commands/createNewFileFromTemplate';

export function activate(context: vscode.ExtensionContext): void {
  console.log('Active');

  setExtensionContext(context);

  vscode.workspace.registerFileSystemProvider(
    FTM_FS_SCHEME,
    new FileTemplateManagerFileSystemProvider(),
    { isCaseSensitive: true },
  );

  const createNewFileTemplateCmd = vscode.commands.registerCommand(
    'file-template-manager.createNewFileTemplate',
    createNewFileTemplate,
  );

  const editFileTemplateCmd = vscode.commands.registerCommand(
    'file-template-manager.editFileTemplate',
    editFileTemplate,
  );

  const removeFileTemplateCmd = vscode.commands.registerCommand(
    'file-template-manager.removeFileTemplate',
    removeFileTemplate,
  );

  const createNewFileFromTemplateCmd = vscode.commands.registerCommand(
    'file-template-manager.createNewFileFromTemplate',
    createNewFileFromTemplate,
  );

  context.subscriptions.push(createNewFileTemplateCmd);
  context.subscriptions.push(editFileTemplateCmd);
  context.subscriptions.push(removeFileTemplateCmd);
  context.subscriptions.push(createNewFileFromTemplateCmd);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  setExtensionContext(null);
}
