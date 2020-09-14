import { getTemplate } from '../../domain/templates';

type TemplateQuickPickItem = {
  label: string;
  description ?: string;
  picked ?: boolean;
};

/**
 * Map a template name to a template quick pick item.
 */
export default (name: string, picked ?: boolean): TemplateQuickPickItem => {
  const template = getTemplate(name);

  if (!template) {
    // This should never happen.
    throw Error(`Could not find template '${name}'`);
  }

  return {
    label: name,
    description: template.ext ? `${template.ext}` : 'No extension',
    picked,
  };
};
