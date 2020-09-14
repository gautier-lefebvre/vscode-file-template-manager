import { stringify } from 'querystring';

import * as vscode from 'vscode';

import { FTM_FS_SCHEME } from '../config/constants';

/**
 * Given a name and extension, generate a name for the template editor,
 * and return the Uri with the name and extension in the query string.
 *
 * @param name - Name of the template.
 * @param ext - Extension of the template.
 */
export function createTemplateEditorUri(name: string, ext = ''): vscode.Uri {
  const queryString = stringify({
    name,
    ext,
  });

  const uri = vscode.Uri.parse(
    `${FTM_FS_SCHEME}:/${encodeURIComponent(`[TEMPLATE] ${name}${ext}`)}?${queryString}`,
  );

  return uri;
}

/**
 * Show the template in the editor.
 * @param name - Template name.
 * @param ext - Template file extension.
 */
export async function openTemplateEditor(name: string, ext = ''): Promise<void> {
  const uri = createTemplateEditorUri(name, ext);
  const templateDocument = await vscode.workspace.openTextDocument(uri);
  vscode.window.showTextDocument(templateDocument);
}
