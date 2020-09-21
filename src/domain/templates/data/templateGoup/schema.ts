import Ajv from 'ajv';

const templateGroupMetadataAjv = new Ajv({ allErrors: true });

export const templateGroupMetadataSchema = {
  $id: '/templates/templateGroupMetadata.schema.json',
  title: 'TemplateGroupMetadata',
  description: 'Template group metadata',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      description: 'Display name of the template group.',
      type: 'string',
    },

    templates: {
      description: 'List of templates in this template group.',
      type: 'array',
      items: {
        description: 'Template id',
        type: 'string',
      },
    },

    templatesUseSameVariables: {
      description: 'If multiple templates in the group have the same variables in their name, only prompt once.',
      type: 'boolean',
    },

    disabled: {
      description: 'Should never be displayed except in "Enable template group".',
      type: 'boolean',
    },
  },
};

export const templateGroupMetadataValidate = templateGroupMetadataAjv.compile(
  templateGroupMetadataSchema,
);
