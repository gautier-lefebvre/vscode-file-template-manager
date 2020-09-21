export class TemplateGroupMetadata {
  /** Unique identifier. */
  id: string;

  /** Display name of the template group. */
  name: string;

  /** Ids of templates in the template group. */
  templates: string[];

  /** If multiple templates in the group have the same variables in their name, only prompt once. */
  templatesUseSameVariables: boolean;

  /** Never show this group. */
  disabled: boolean;

  constructor({
    id,
    name,
    templates = [],
    templatesUseSameVariables = true,
    disabled = false,
  }: {
    id: string,
    name: string,
    templates?: string[],
    templatesUseSameVariables?: boolean,
    disabled?: boolean,
  }) {
    this.id = id;
    this.name = name;
    this.templates = templates;
    this.templatesUseSameVariables = templatesUseSameVariables;
    this.disabled = disabled;
  }
}
