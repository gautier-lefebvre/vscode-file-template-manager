import { basename, dirname, join } from 'path';
import { TextDecoder, TextEncoder } from 'util';

import slugify from 'slugify';
import {
  RelativePattern,
  Uri,
  window,
  workspace,
} from 'vscode';

import {
  TEMPLATES_FOLDER,
  TEMPLATES_GLOB_PATTERN,
  TEMPLATE_CONTENT_PLACEHOLDER,
  TEMPLATE_GROUPS_FOLDER,
  TEMPLATE_GROUPS_GLOB_PATTERN,
  TEMPLATE_METADATA_FILENAME,
} from '../../../../constants';
import { logger } from '../../../../services/logger';
import { compact } from '../../../../utils/array';
import { FolderConfiguration } from '../../../config/types';
import { Template, TemplateMetadata, templateMetadataValidate } from '../../data/template';
import { TemplateGroup, TemplateGroupMetadata, templateGroupMetadataValidate } from '../../data/templateGoup';

export type TemplateToCreate = {
  name: string;
  fileTemplateName: string;
  onlyAsPartOfGroup: boolean;
};

export type TemplateGroupToCreate = {
  name: string;
  templates: string[];
  templatesUseSameVariables: boolean;
};

export type TemplateToEdit = TemplateMetadata;

export interface IFolderTemplatesService {
  folderUri: Uri;
  getFolderConfiguration(): Promise<FolderConfiguration>;
  getTemplates(): Promise<ReadonlyArray<Template>>;
  getTemplateById(id: string): Promise<Template | undefined>;
  getTemplateGroups(): Promise<ReadonlyArray<TemplateGroup>>;
  getTemplateGroupById(id: string): Promise<TemplateGroup | undefined>;
  createTemplate(template: TemplateToCreate): Promise<Template>;
}

export abstract class FolderTemplatesService implements IFolderTemplatesService {
  public readonly folderUri: Uri;

  private static async loadTemplate(
    folderConfiguration: FolderConfiguration,
    metadataFileUri: Uri,
  ): Promise<Template | undefined> {
    const templateFolderUri = Uri.parse(dirname(metadataFileUri.path));
    const templateFolderName = basename(templateFolderUri.path);

    try {
      // Read and parse metadata file.
      const content = await workspace.fs.readFile(metadataFileUri);
      const parsedMetadata = JSON.parse(new TextDecoder('utf-8').decode(content));

      // Validate metadata against JSON schema.
      if (!templateMetadataValidate(parsedMetadata)) {
        // Print errors in the output channel and abort.
        logger.appendLine(JSON.stringify(templateMetadataValidate.errors || [], null, 2));
        throw Error('Template metadata did not match schema');
      }

      return new Template(
        folderConfiguration,
        templateFolderUri,
        new TemplateMetadata({
          ...parsedMetadata,
          id: templateFolderName,
        }),
      );
    } catch (err) {
      logger.appendLine(err);

      // Show warning and abort.
      window.showWarningMessage(`Could not load metadata in template folder ${templateFolderUri.path}. Template is omitted.`);

      return undefined;
    }
  }

  private static async loadTemplateGroup(
    folderConfiguration: FolderConfiguration,
    metadataFileUri: Uri,
  ): Promise<TemplateGroup | undefined> {
    const id = basename(metadataFileUri.path, '.json');

    try {
      // Read and parse metadata file.
      const content = await workspace.fs.readFile(metadataFileUri);
      const parsedMetadata = JSON.parse(new TextDecoder('utf-8').decode(content));

      // Validate metadata against JSON schema.
      if (!templateGroupMetadataValidate(parsedMetadata)) {
        // Print errors in the output channel and abort.
        logger.appendLine(JSON.stringify(templateGroupMetadataValidate.errors || [], null, 2));
        throw Error('Template group metadata did not match schema');
      }

      return new TemplateGroup(
        folderConfiguration,
        metadataFileUri,
        new TemplateGroupMetadata({
          ...parsedMetadata,
          id,
        }),
      );
    } catch (err) {
      logger.appendLine(err);

      // Show warning and abort.
      window.showWarningMessage(`Could not load template group metadata file at ${metadataFileUri.path}. Template group is omitted.`);

      return undefined;
    }
  }

  private static async saveMetadata(
    metadataFileUri: Uri,
    { id, ...metadataFileContent }: TemplateMetadata | TemplateGroupMetadata,
  ): Promise<void> {
    await workspace.fs.writeFile(
      metadataFileUri,
      new TextEncoder().encode(`${JSON.stringify(metadataFileContent, null, 2)}\n`),
    );
  }

  constructor(folderUri: Uri) {
    this.folderUri = folderUri;
  }

  public abstract async getFolderConfiguration(): Promise<FolderConfiguration>;

  public async getTemplates(): Promise<ReadonlyArray<Template>> {
    const folderConfiguration = await this.getFolderConfiguration();

    const templatesMetadataFiles = await workspace.findFiles(
      new RelativePattern(
        this.folderUri.fsPath,
        join(folderConfiguration.templatesFolderPath, TEMPLATES_GLOB_PATTERN)
          .replace(/\\+/g, '/'),
      ),
    );

    const templates = await Promise.all(templatesMetadataFiles.map(
      (metadataFileUri) => FolderTemplatesService.loadTemplate(
        folderConfiguration,
        metadataFileUri,
      ),
    ));

    return compact(templates);
  }

  public async getTemplateById(id: string): Promise<Template | undefined> {
    const folderConfiguration = await this.getFolderConfiguration();
    const metadataFileUri = await this.getTemplateMetadataFileUri(id, folderConfiguration);

    try {
      await workspace.fs.stat(metadataFileUri);
    } catch (err) {
      switch (err) {
        case 'FileNotFound':
          return undefined;
        default:
          logger.appendLine(err);
          return undefined;
      }
    }

    return FolderTemplatesService.loadTemplate(folderConfiguration, metadataFileUri);
  }

  public async getTemplateGroups(): Promise<ReadonlyArray<TemplateGroup>> {
    const folderConfiguration = await this.getFolderConfiguration();

    const templateGroupsMetadataFiles = await workspace.findFiles(
      new RelativePattern(
        this.folderUri.fsPath,
        join(folderConfiguration.templatesFolderPath, TEMPLATE_GROUPS_GLOB_PATTERN)
          .replace(/\\+/g, '/'),
      ),
    );

    const templateGroups = await Promise.all(templateGroupsMetadataFiles.map(
      (metadataFileUri) => FolderTemplatesService.loadTemplateGroup(
        folderConfiguration,
        metadataFileUri,
      ),
    ));

    return compact(templateGroups);
  }

  public async getTemplateGroupById(id: string): Promise<TemplateGroup | undefined> {
    const folderConfiguration = await this.getFolderConfiguration();
    const metadataFileUri = await this.getTemplateGroupMetadataFileUri(id, folderConfiguration);

    try {
      await workspace.fs.stat(metadataFileUri);
    } catch (err) {
      switch (err) {
        case 'FileNotFound':
          return undefined;
        default:
          logger.appendLine(err);
          return undefined;
      }
    }

    return FolderTemplatesService.loadTemplateGroup(folderConfiguration, metadataFileUri);
  }

  public async createTemplate(templateToCreate: TemplateToCreate): Promise<Template> {
    const folderConfiguration = await this.getFolderConfiguration();

    const templateMetadata = new TemplateMetadata({
      ...templateToCreate,
      id: await this.generateTemplateId(templateToCreate.name, folderConfiguration),
      disabled: false,
    });

    const template = new Template(
      folderConfiguration,
      await this.getTemplateFolderUri(templateMetadata.id, folderConfiguration),
      templateMetadata,
    );

    await Promise.all([
      FolderTemplatesService.saveMetadata(template.metadataFileUri, template.metadata),

      workspace.fs.writeFile(
        template.contentFileUri,
        new TextEncoder().encode(TEMPLATE_CONTENT_PLACEHOLDER),
      ),
    ]);

    return template;
  }

  public async editTemplate(templateMetadataUri: Uri, updatedMetadata: TemplateMetadata)
    : Promise<void> {
    return FolderTemplatesService.saveMetadata(templateMetadataUri, updatedMetadata);
  }

  public async removeTemplate(templateFolderUri: Uri): Promise<void> {
    await workspace.fs.delete(templateFolderUri, { recursive: true, useTrash: true });
  }

  public async createTemplateGroup(templateGroupToCreate: TemplateGroupToCreate)
    : Promise<TemplateGroup> {
    const folderConfiguration = await this.getFolderConfiguration();

    const templateGroupMetadata = new TemplateGroupMetadata({
      ...templateGroupToCreate,
      id: await this.generateTemplateId(templateGroupToCreate.name, folderConfiguration),
      disabled: false,
    });

    const templateGroup = new TemplateGroup(
      folderConfiguration,
      await this.getTemplateGroupMetadataFileUri(templateGroupMetadata.id, folderConfiguration),
      templateGroupMetadata,
    );

    await FolderTemplatesService.saveMetadata(
      templateGroup.metadataFileUri,
      templateGroup.metadata,
    );

    return templateGroup;
  }

  public async editTemplateGroup(
    templateGroupMetadataUri: Uri,
    updatedMetadata: TemplateGroupMetadata,
  ): Promise<void> {
    return FolderTemplatesService.saveMetadata(templateGroupMetadataUri, updatedMetadata);
  }

  public async removeTemplateGroup(templateGroupMetadataUri: Uri): Promise<void> {
    await workspace.fs.delete(templateGroupMetadataUri, { recursive: false, useTrash: true });
  }

  protected async getTemplateFolderUri(id: string, folderConfiguration?: FolderConfiguration)
    : Promise<Uri> {
    const { templatesFolderPath } = folderConfiguration || await this.getFolderConfiguration();

    return Uri.joinPath(
      this.folderUri,
      templatesFolderPath,
      TEMPLATES_FOLDER,
      id,
    );
  }

  protected async getTemplateMetadataFileUri(id: string, folderConfiguration?: FolderConfiguration)
    : Promise<Uri> {
    return Uri.joinPath(
      await this.getTemplateFolderUri(id, folderConfiguration),
      TEMPLATE_METADATA_FILENAME,
    );
  }

  protected async getTemplateGroupMetadataFileUri(
    id: string,
    folderConfiguration?: FolderConfiguration,
  ) : Promise<Uri> {
    const { templatesFolderPath } = folderConfiguration || await this.getFolderConfiguration();

    return Uri.joinPath(
      this.folderUri,
      templatesFolderPath,
      TEMPLATE_GROUPS_FOLDER,
      `${id}.json`,
    );
  }

  protected async generateId(
    name: string,
    getUri: (id: string, folderConfiguration?: FolderConfiguration) => Promise<Uri>,
    errorMessage: string,
    folderConfiguration ?: FolderConfiguration,
  ): Promise<string> {
    const slugName = slugify(name, { lower: true, strict: true });
    const configuration = folderConfiguration || await this.getFolderConfiguration();

    let count = 0;

    do {
      // Limit to 100 tries (it should be enough hopefully) to prevent infinite loops.
      count += 1;

      // Add a number to the id after the first try.
      const id = `${slugName}${count === 1 ? '' : `-${count}`}`;

      // Check that the folder does not already exist.
      try {
        await workspace.fs.stat(await getUri(id, configuration));
      } catch (err) {
        switch (err.code) {
          case 'FileNotFound':
            return id;
          default:
            throw err;
        }
      }
    } while (count < 100);

    throw Error(errorMessage);
  }

  protected async generateTemplateId(
    name: string,
    folderConfiguration?: FolderConfiguration,
  ): Promise<string> {
    return this.generateId(
      name,
      (id, configuration) => this.getTemplateFolderUri(id, configuration),
      'Could not generate an id for the template after 100 tries. Aborting.',
      folderConfiguration,
    );
  }

  protected async generateTemplateGroupId(
    name: string,
    folderConfiguration ?: FolderConfiguration,
  ): Promise<string> {
    return this.generateId(
      name,
      (id, configuration) => this.getTemplateGroupMetadataFileUri(id, configuration),
      'Could not generate an id for the template group after 100 tries. Aborting.',
      folderConfiguration,
    );
  }
}
