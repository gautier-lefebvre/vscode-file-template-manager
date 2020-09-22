import { config } from '../../../config';
import { FolderConfiguration } from '../../../config/types';
import { FolderTemplatesService } from './base';

export class WorkspaceFolderTemplatesService extends FolderTemplatesService {
  public async getFolderConfiguration(): Promise<FolderConfiguration> {
    return config.getWorkspaceFolderConfiguration(this.folderUri);
  }
}
