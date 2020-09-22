import { isDeepStrictEqual } from 'util';

import { Uri } from 'vscode';

import { Template, TemplateMetadata } from '../data/template';
import { TemplateGroupToCreate, TemplateToCreate } from './folder/base';
import { TemplateGroup, TemplateGroupMetadata } from '../data/templateGoup';
import { GlobalFolderTemplatesService } from './folder/global';
import { WorkspaceFolderTemplatesService } from './folder/workspaceFolder';
import { FolderConfiguration } from '../../config/types';

class TemplatesService {
  private workspaceFolderTemplatesServicesCache
  : {
    [workspaceFolderPath: string]: {
      service: WorkspaceFolderTemplatesService,
      folderConfiguration: FolderConfiguration
    }
  }
  = {};

  private globalFolderTemplatesServiceCache
  : {
    service: GlobalFolderTemplatesService,
    folderConfiguration: FolderConfiguration,
  } | null
  = null;

  private async getWorkspaceFolderTemplatesService(workspaceFolderUri: Uri)
    : Promise<WorkspaceFolderTemplatesService> {
    const cache = this.workspaceFolderTemplatesServicesCache[workspaceFolderUri.path];

    let currentConfiguration;
    if (cache) {
      currentConfiguration = await cache.service.getFolderConfiguration();

      if (isDeepStrictEqual(currentConfiguration, cache.folderConfiguration)) {
        return cache.service;
      }
    }

    const service = new WorkspaceFolderTemplatesService(workspaceFolderUri);

    this.workspaceFolderTemplatesServicesCache[workspaceFolderUri.path] = {
      service,
      folderConfiguration: currentConfiguration || await service.getFolderConfiguration(),
    };

    return service;
  }

  private async getGlobalFolderTemplatesService()
  : Promise<GlobalFolderTemplatesService> {
    const cache = this.globalFolderTemplatesServiceCache;

    let currentConfiguration;
    if (cache) {
      currentConfiguration = await cache.service.getFolderConfiguration();

      if (isDeepStrictEqual(currentConfiguration, cache.folderConfiguration)) {
        return cache.service;
      }
    }

    const service = new GlobalFolderTemplatesService();

    this.globalFolderTemplatesServiceCache = {
      service,
      folderConfiguration: currentConfiguration || await service.getFolderConfiguration(),
    };

    return service;
  }

  public async getTemplatesOfWorkspaceFolder(workspaceFolderUri: Uri)
    : Promise<ReadonlyArray<Template>> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.getTemplates();
  }

  public async getTemplateOfWorkspaceFolderById(workspaceFolderUri: Uri, id: string)
    : Promise<Template | undefined> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.getTemplateById(id);
  }

  public async getTemplateGroupsOfWorkspaceFolder(workspaceFolderUri: Uri)
    : Promise<ReadonlyArray<TemplateGroup>> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.getTemplateGroups();
  }

  public async getTemplateGroupOfWorkspaceFolderById(workspaceFolderUri: Uri, id: string)
    : Promise<TemplateGroup | undefined> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.getTemplateGroupById(id);
  }

  public async createWorkspaceFolderTemplate(
    workspaceFolderUri: Uri,
    templateToCreate: TemplateToCreate,
  ): Promise<Template> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.createTemplate(templateToCreate);
  }

  public async editWorkspaceFolderTemplate(
    workspaceFolderUri: Uri,
    templateMetadataUri: Uri,
    updatedMetadata: TemplateMetadata,
  )
    : Promise<void> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.editTemplate(templateMetadataUri, updatedMetadata);
  }

  public async removeWorkspaceFolderTemplate(workspaceFolderUri: Uri, templateFolderUri: Uri)
    : Promise<void> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.removeTemplate(templateFolderUri);
  }

  public async createWorkspaceFolderTemplateGroup(
    workspaceFolderUri: Uri,
    templateGroupToCreate: TemplateGroupToCreate,
  )
    : Promise<TemplateGroup> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.createTemplateGroup(templateGroupToCreate);
  }

  public async editWorkspaceFolderTemplateGroup(
    workspaceFolderUri: Uri,
    templateGroupMetadataUri: Uri,
    updatedMetadata: TemplateGroupMetadata,
  )
    : Promise<void> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.editTemplateGroup(templateGroupMetadataUri, updatedMetadata);
  }

  public async removeWorkspaceFolderTemplateGroup(
    workspaceFolderUri: Uri,
    templateGroupMetadataUri: Uri,
  ): Promise<void> {
    const folderService = await this.getWorkspaceFolderTemplatesService(workspaceFolderUri);
    return folderService.removeTemplateGroup(templateGroupMetadataUri);
  }

  public async getGlobalTemplates(): Promise<ReadonlyArray<Template>> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.getTemplates();
  }

  public async getGlobalTemplateById(id: string): Promise<Template | undefined> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.getTemplateById(id);
  }

  public async getGlobalTemplateGroups(): Promise<ReadonlyArray<TemplateGroup>> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.getTemplateGroups();
  }

  public async getGlobalTemplateGroupById(id: string): Promise<TemplateGroup | undefined> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.getTemplateGroupById(id);
  }

  public async createGlobalTemplate(templateToCreate: TemplateToCreate): Promise<Template> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.createTemplate(templateToCreate);
  }

  public async editGlobalTemplate(templateMetadataUri: Uri, updatedMetadata: TemplateMetadata)
    : Promise<void> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.editTemplate(templateMetadataUri, updatedMetadata);
  }

  public async removeGlobalTemplate(templateFolderUri: Uri): Promise<void> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.removeTemplate(templateFolderUri);
  }

  public async createGlobalTemplateGroup(templateGroupToCreate: TemplateGroupToCreate)
    : Promise<TemplateGroup> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.createTemplateGroup(templateGroupToCreate);
  }

  public async editGlobalTemplateGroup(
    templateGroupMetadataUri: Uri,
    updatedMetadata: TemplateGroupMetadata,
  ): Promise<void> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.editTemplateGroup(templateGroupMetadataUri, updatedMetadata);
  }

  public async removeGlobalTemplateGroup(templateGroupMetadataUri: Uri): Promise<void> {
    const globalFolderService = await this.getGlobalFolderTemplatesService();
    return globalFolderService.removeTemplateGroup(templateGroupMetadataUri);
  }
}

export const templatesService = new TemplatesService();
