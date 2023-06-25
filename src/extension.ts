import { commands, ExtensionContext } from 'vscode';

import { createFileFromTemplate } from './commands/createFileFromTemplate';
import { createFilesFromTemplateGroup } from './commands/createFilesFromTemplateGroup';
import { createTemplate } from './commands/createTemplate';
import { createTemplateGroup } from './commands/createTemplateGroup';
import { editGlobalConfiguration } from './commands/editGlobalConfiguration';
import { editTemplate } from './commands/editTemplate';
import { editTemplateGroupMetadata } from './commands/editTemplateGroupMetadata';
import { editTemplateMetadata } from './commands/editTemplateMetadata';
import { editWorkspaceFolderConfiguration } from './commands/editWorkspaceFolderConfiguration';
import { removeTemplate } from './commands/removeTemplate';
import { removeTemplateGroup } from './commands/removeTemplateGroup';
import { COMMANDS } from './constants';
import { config } from './domain/config';
import { setExtensionContext } from './services/extensionContext';

export async function activate(context: ExtensionContext): Promise<void> {
  setExtensionContext(context);

  // Remove unnecessary caches when workspace folders change.
  config.watch();

  // Register all command handlers.

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.CREATE_TEMPLATE,
    createTemplate,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.EDIT_TEMPLATE,
    editTemplate,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.EDIT_TEMPLATE_METADATA,
    editTemplateMetadata,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.REMOVE_TEMPLATE,
    removeTemplate,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.CREATE_TEMPLATE_GROUP,
    createTemplateGroup,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.EDIT_TEMPLATE_GROUP_METADATA,
    editTemplateGroupMetadata,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.REMOVE_TEMPLATE_GROUP,
    removeTemplateGroup,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.CREATE_FILE_FROM_TEMPLATE,
    createFileFromTemplate,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.CREATE_FILES_FROM_TEMPLATE_GROUP,
    createFilesFromTemplateGroup,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.EDIT_GLOBAL_CONFIGURATION,
    editGlobalConfiguration,
  ));

  context.subscriptions.push(commands.registerCommand(
    COMMANDS.EDIT_WORKSPACE_FOLDER_CONFIGURATION,
    editWorkspaceFolderConfiguration,
  ));
}

// This method is called when your extension is deactivated.
export function deactivate(): void {
  config.dispose();

  setExtensionContext(null);
}
