import * as vscode from 'vscode';
import { decode as qsDecode } from 'querystring';

import { createTemplate, getTemplate, removeTemplate, updateTemplate } from './templates';

export default class FileTemplateManagerFileSystemProvider implements vscode.FileSystemProvider {
  onDidChangeFileEmitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  onDidChangeFile = this.onDidChangeFileEmitter.event;

  _bufferedEvents: vscode.FileChangeEvent[] = [];
  _eventEmitTimeoutHandle: NodeJS.Timeout | null = null;

  _emitEvent(event: vscode.FileChangeEvent): void {
    this._bufferedEvents.push(event);

    if (this._eventEmitTimeoutHandle) {
      clearTimeout(this._eventEmitTimeoutHandle);
    }

    this._eventEmitTimeoutHandle = setTimeout(
      () => {
        this.onDidChangeFileEmitter.fire(this._bufferedEvents);
        this._bufferedEvents = [];
        this._eventEmitTimeoutHandle = null;
      },
      10,
    );
  }

  readFile(uri: vscode.Uri): Uint8Array {
    const { name } = qsDecode(uri.query) as { name: string, ext: string };
    return getTemplate(name)?.content || new Uint8Array();
  }

  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
  ): Thenable<void> {
    const { name, ext } = qsDecode(uri.query) as { name: string, ext: string };

    const template = getTemplate(name);

    if (!template) {
      await createTemplate(name, ext);
      this._emitEvent({ type: vscode.FileChangeType.Created, uri: uri });
    }

    await updateTemplate(name, content);
    this._emitEvent({ type: vscode.FileChangeType.Changed, uri: uri });
  }

  stat(uri: vscode.Uri): vscode.FileStat {
    const { name } = qsDecode(uri.query) as { name: string };
    const template = getTemplate(name);

    return template
      ? {
        ctime: template.ctime,
        mtime: template.mtime,
        size: template.content.byteLength,
        type: vscode.FileType.File,
      } : {
        ctime: Date.now(),
        mtime: Date.now(),
        size: 0,
        type: vscode.FileType.File,
      };
  }

  async delete(uri: vscode.Uri): Thenable<void> {
    const { name } = qsDecode(uri.query) as { name: string };
    await removeTemplate(name);
    this._emitEvent({ type: vscode.FileChangeType.Deleted, uri: uri });
  }

  watch(): vscode.Disposable {
    // Ignore. Events are fired.
    return new vscode.Disposable(() => null);
  }

  copy(): void {
    // Ignore. Cannot copy templates.
  }

  createDirectory(): void {
    // Ignore. Cannot create template directories.
  }

  readDirectory(): [string, vscode.FileType][] {
    // Ignore. Cannot create template directories.
    return [];
  }

  rename(): void {
    // Ignore. Cannot rename a template.
  }
}
