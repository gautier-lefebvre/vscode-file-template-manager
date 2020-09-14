import * as vscode from 'vscode';

import {
  CREATE_FILE_TEMPLATE_COMMAND_ID,
  EDIT_FILE_TEMPLATE_COMMAND_ID,
  REMOVE_FILE_TEMPLATE_COMMAND_ID,
  CREATE_TEMPLATE_GROUP_COMMAND_ID,
  EDIT_TEMPLATE_GROUP_COMMAND_ID,
  REMOVE_TEMPLATE_GROUP_COMMAND_ID,
  CREATE_FILE_FROM_TEMPLATE_COMMAND_ID,
  CREATE_FILES_FROM_TEMPLATE_GROUP_COMMAND_ID,
  FTM_FS_SCHEME,
} from './config/constants';
import { setExtensionContext } from './domain/templates';
import FileTemplateManagerFileSystemProvider from './domain/fileSystemProvider';

import createNewFileTemplate from './commands/createNewFileTemplate';
import editFileTemplate from './commands/editFileTemplate';
import removeFileTemplate from './commands/removeFileTemplate';
import createNewTemplateGroup from './commands/createNewTemplateGroup';
import editTemplateGroup from './commands/editTemplateGroup';
import removeTemplateGroup from './commands/removeTemplateGroup';
import createNewFileFromTemplate from './commands/createNewFileFromTemplate';
import createNewFilesFromTemplateGroup from './commands/createNewFilesFromTemplateGroup';

export function activate(context: vscode.ExtensionContext): void {
  setExtensionContext(context);

  // Register the template file system provider.
  // Any Uri starting with our custom scheme will be redirected to our custom file system.
  vscode.workspace.registerFileSystemProvider(
    FTM_FS_SCHEME,
    new FileTemplateManagerFileSystemProvider(),
    { isCaseSensitive: true },
  );

  // Register all command handlers.

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

  const createNewTemplateGroupCmd = vscode.commands.registerCommand(
    CREATE_TEMPLATE_GROUP_COMMAND_ID,
    createNewTemplateGroup,
  );

  const editTemplateGroupCmd = vscode.commands.registerCommand(
    EDIT_TEMPLATE_GROUP_COMMAND_ID,
    editTemplateGroup,
  );

  const removeTemplateGroupCmd = vscode.commands.registerCommand(
    REMOVE_TEMPLATE_GROUP_COMMAND_ID,
    removeTemplateGroup,
  );

  const createNewFileFromTemplateCmd = vscode.commands.registerCommand(
    CREATE_FILE_FROM_TEMPLATE_COMMAND_ID,
    createNewFileFromTemplate,
  );

  const createNewFilesFromTemplateGroupCmd = vscode.commands.registerCommand(
    CREATE_FILES_FROM_TEMPLATE_GROUP_COMMAND_ID,
    createNewFilesFromTemplateGroup,
  );

  context.subscriptions.push(createNewFileTemplateCmd);
  context.subscriptions.push(editFileTemplateCmd);
  context.subscriptions.push(removeFileTemplateCmd);
  context.subscriptions.push(createNewTemplateGroupCmd);
  context.subscriptions.push(editTemplateGroupCmd);
  context.subscriptions.push(removeTemplateGroupCmd);
  context.subscriptions.push(createNewFileFromTemplateCmd);
  context.subscriptions.push(createNewFilesFromTemplateGroupCmd);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  setExtensionContext(null);
}
