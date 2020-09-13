import * as vscode from 'vscode';

import {
  CREATE_FILE_TEMPLATE_COMMAND_ID,
  EDIT_FILE_TEMPLATE_COMMAND_ID,
  REMOVE_FILE_TEMPLATE_COMMAND_ID,
  CREATE_FILE_FROM_TEMPLATE_COMMAND_ID,
  FTM_FS_SCHEME,
} from './config/constants';
import { setExtensionContext } from './domain/templates';
import FileTemplateManagerFileSystemProvider from './domain/fileSystemProvider';

import createNewFileTemplate from './commands/createNewFileTemplate';
import editFileTemplate from './commands/editFileTemplate';
import removeFileTemplate from './commands/removeFileTemplate';
import createNewFileFromTemplate from './commands/createNewFileFromTemplate';

export function activate(context: vscode.ExtensionContext): void {
  setExtensionContext(context);

  vscode.workspace.registerFileSystemProvider(
    FTM_FS_SCHEME,
    new FileTemplateManagerFileSystemProvider(),
    { isCaseSensitive: true },
  );

  const createNewFileTemplateCmd = vscode.commands.registerCommand(
    CREATE_FILE_TEMPLATE_COMMAND_ID,
    createNewFileTemplate,
  );

  const editFileTemplateCmd = vscode.commands.registerCommand(
    EDIT_FILE_TEMPLATE_COMMAND_ID,
    editFileTemplate,
  );

  const removeFileTemplateCmd = vscode.commands.registerCommand(
    REMOVE_FILE_TEMPLATE_COMMAND_ID,
    removeFileTemplate,
  );

  const createNewFileFromTemplateCmd = vscode.commands.registerCommand(
    CREATE_FILE_FROM_TEMPLATE_COMMAND_ID,
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
