import * as vscode from 'vscode';
import { decode as qsDecode } from 'querystring';

import {
  createTemplate,
  getTemplate,
  removeTemplate,
  updateTemplate,
} from './templates';

/**
 * I need to be able to show the content of the template in the editor and let the user save it
 * like it is a regular file without actually saving in on the disk.
 * There might be a better way to do it, but I implement a fake file system for my templates.
 */
export default class FileTemplateManagerFileSystemProvider implements vscode.FileSystemProvider {
  /** Event emitter. */
  onDidChangeFileEmitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

  /** Event handle. */
  onDidChangeFile = this.onDidChangeFileEmitter.event;

  /**
   * Get the content of a template.
   * If the template does not exist, return an empty content.
   * @param uri - Looks like SCHEME:/TEMPLATE_FILE_NAME?name=templateName.
   */
  readFile(uri: vscode.Uri): Uint8Array {
    const { name } = qsDecode(uri.query) as { name: string, ext: string };
    return getTemplate(name)?.content || new Uint8Array();
  }

  /**
   * Persist a template. If the template was not already created, create it.
   * @param uri - Looks like SCHEME:/TEMPLATE_FILE_NAME?name=templateName&ext=.ext.
   * @param content - Template content.
   */
  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
  ): Promise<void> {
    const { name, ext } = qsDecode(uri.query) as { name: string, ext: string };

    const template = getTemplate(name);

    // Not found -> never saved, so create the template.
    if (!template) {
      await createTemplate(name, ext);
      this.emitEvent({ type: vscode.FileChangeType.Created, uri });
    }

    // Update the file content.
    await updateTemplate(name, content);
    this.emitEvent({ type: vscode.FileChangeType.Changed, uri });
  }

  /**
   * Implement stat on a template. If the template does not exist, just return an empty stat.
   * @param uri - Looks like SCHEME:/TEMPLATE_FILE_NAME?name=templateName.
   * @returns File stat.
   */
  stat(uri: vscode.Uri): vscode.FileStat {
    const { name } = qsDecode(uri.query) as { name: string };
    const template = getTemplate(name);

    return {
      ctime: template?.ctime || Date.now(),
      mtime: template?.mtime || Date.now(),
      size: template?.content.byteLength || 0,
      type: vscode.FileType.File,
    };
  }

  /**
   * Remove a template.
   * @param uri - Looks like SCHEME:/TEMPLATE_FILE_NAME?name=templateName.
   */
  async delete(uri: vscode.Uri): Promise<void> {
    const { name } = qsDecode(uri.query) as { name: string };
    await removeTemplate(name);
    this.emitEvent({ type: vscode.FileChangeType.Deleted, uri });
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

  /** List of buffered to flush. Event firing is debounced. */
  private bufferedEvents: vscode.FileChangeEvent[] = [];

  /** Debounced event firing handle. */
  private eventEmitTimeoutHandle: NodeJS.Timeout | null = null;

  /**
   * Bufferize the event and reinit debounce.
   * @param event - Event to emit.
   */
  private emitEvent(event: vscode.FileChangeEvent): void {
    this.bufferedEvents.push(event);

    if (this.eventEmitTimeoutHandle) {
      clearTimeout(this.eventEmitTimeoutHandle);
    }

    this.eventEmitTimeoutHandle = setTimeout(
      () => {
        this.onDidChangeFileEmitter.fire(this.bufferedEvents);
        this.bufferedEvents = [];
        this.eventEmitTimeoutHandle = null;
      },
      10,
    );
  }
}
