import { Uri } from 'vscode';

import { FolderConfiguration } from '../../../config/types';

import { TemplateGroupMetadata } from './metadata';

export { TemplateGroupMetadata };
export { templateGroupMetadataValidate } from './schema';

export class TemplateGroup {
  public readonly folderConfiguration: FolderConfiguration;

  public readonly metadataFileUri: Uri;

  public readonly metadata: TemplateGroupMetadata;

  constructor(
    folderConfiguration: FolderConfiguration,
    metadataFileUri: Uri,
    metadata: TemplateGroupMetadata,
  ) {
    this.folderConfiguration = folderConfiguration;
    this.metadataFileUri = metadataFileUri;
    this.metadata = metadata;
  }
}
