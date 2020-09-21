import { getExtensionContext } from '../../../../services/extensionContext';
import { getGlobalFolderConfiguration } from '../../../config';
import { FolderConfiguration } from '../../../config/types';
import { FolderTemplatesService } from './base';

export class GlobalFolderTemplatesService extends FolderTemplatesService {
  constructor() {
    super(getExtensionContext().globalStorageUri);
  }

  public async getFolderConfiguration(): Promise<FolderConfiguration> {
    return getGlobalFolderConfiguration();
  }
}
