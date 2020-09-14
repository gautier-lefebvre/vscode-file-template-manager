import * as vscode from 'vscode';
import { createTemplateGroup } from '../domain/templates';

import listTemplatesAndAskToCreateIfEmpty from './common/listTemplatesAndAskToCreateIfEmpty';

export default async (): Promise<void> => {
  const userTemplates = await listTemplatesAndAskToCreateIfEmpty();

  if (userTemplates === undefined) {
    return;
  }

  const selectedTemplates = await vscode.window.showQuickPick(
    userTemplates,
    { canPickMany: true },
  );

  // If no template selected or user pressed Esc, abort.
  if (!selectedTemplates?.length) { return; }

  const templateGroupName = await vscode.window.showInputBox({
    prompt: 'Template group name',
    placeHolder: 'React Component Group',
  });

  // If no template group name given, return;
  if (!templateGroupName) { return; }

  await createTemplateGroup(templateGroupName, selectedTemplates);
};
