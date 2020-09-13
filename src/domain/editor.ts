import { stringify } from 'querystring';

import * as vscode from 'vscode';

import { FTM_FS_SCHEME } from '../config/constants';

export function createTemplateEditorUri(name: string, ext: string | undefined): vscode.Uri {
  const templateEditorFileName = `[TEMPLATE] ${name}${ext || ''}`;

  const queryString = stringify({
    name,
    ext,
  });

  const uri = vscode.Uri.parse(
    `${FTM_FS_SCHEME}:/${encodeURIComponent(templateEditorFileName)}?${queryString}`,
  );

  return uri;
}

export async function openTemplateEditor(name: string, ext: string | undefined): Promise<void> {
  const uri = createTemplateEditorUri(name, ext);
  const templateDocument = await vscode.workspace.openTextDocument(uri);
  vscode.window.showTextDocument(templateDocument);
}
