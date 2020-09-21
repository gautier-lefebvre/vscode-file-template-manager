import Ajv from 'ajv';

const templateMetadataAjv = new Ajv({ allErrors: true });

export const templateMetadataSchema = {
  $id: '/templates/templateMetadata.schema.json',
  title: 'TemplateMetadata',
  description: 'Template metadata',
  type: 'object',
  required: ['name', 'fileTemplateName'],
  properties: {
    name: {
      description: 'Display name of the template.',
      type: 'string',
    },

    fileTemplateName: {
      description: 'File template name (e.g. {{relativePath}}/stuff.{{foo}}.{{bar}}.json)',
      type: 'string',
    },

    onlyAsPartOfGroup: {
      description: 'Should never be proposed in the "New file from template" selection.',
      type: 'boolean',
    },

    disabled: {
      description: 'Should never be displayed except in "Enable template".',
      type: 'boolean',
    },
  },
};

export const templateMetadataValidate = templateMetadataAjv.compile(templateMetadataSchema);
