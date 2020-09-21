import { Uri } from 'vscode';

import { TEMPLATE_CONTENT_FILENAME, TEMPLATE_METADATA_FILENAME } from '../../../../constants';
import { FolderConfiguration } from '../../../config/types';
import { TemplateMetadata } from './metadata';

export { TemplateMetadata };
export { templateMetadataValidate } from './schema';

/**
 * Don't cache this class.
 * The info inside are only valid during a short process, like getting a template to render a file.
 * The configuration may change between commands.
 */
export class Template {
  public readonly folderUri: Uri;

  public readonly metadataFileUri: Uri;

  public readonly contentFileUri: Uri;

  public readonly folderConfiguration: FolderConfiguration;

  public readonly metadata: TemplateMetadata;

  constructor(
    folderConfiguration: FolderConfiguration,
    folderUri: Uri,
    metadata: TemplateMetadata,
  ) {
    this.folderConfiguration = folderConfiguration;
    this.folderUri = folderUri;
    this.metadataFileUri = Uri.joinPath(this.folderUri, TEMPLATE_METADATA_FILENAME);
    this.contentFileUri = Uri.joinPath(this.folderUri, TEMPLATE_CONTENT_FILENAME);
    this.metadata = metadata;
  }
}
