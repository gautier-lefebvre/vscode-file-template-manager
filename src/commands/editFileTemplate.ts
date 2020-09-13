import * as vscode from 'vscode';

import { openTemplateEditor } from '../domain/editor';
import { getTemplate, listTemplates } from '../domain/templates';

export default async (): Promise<void> => {
  const templateToEdit = await vscode.window.showQuickPick(
    listTemplates(),
  );

  if (templateToEdit) {
    const template = getTemplate(templateToEdit);

    if (template) {
      await openTemplateEditor(template.name, template.ext);
    }
  }
};
