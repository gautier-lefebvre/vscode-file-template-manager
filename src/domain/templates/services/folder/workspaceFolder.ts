import { getWorkspaceFolderConfiguration } from '../../../config';
import { FolderConfiguration } from '../../../config/types';
import { FolderTemplatesService } from './base';

export class WorkspaceFolderTemplatesService extends FolderTemplatesService {
  public async getFolderConfiguration(): Promise<FolderConfiguration> {
    return getWorkspaceFolderConfiguration(this.folderUri);
  }
}
