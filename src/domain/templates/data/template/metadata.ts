export class TemplateMetadata {
  /** Unique id (unique to the folder). */
  id: string;

  /** Template display name (when choosing a template to add in a group). */
  name: string;

  /** Name of the file to generate. Example: foo.{{foo}}.{{bar}}.json. */
  fileTemplateName: string;

  /** Should never be proposed in the "New file from template" selection. */
  onlyAsPartOfGroup: boolean;

  /** Should never be displayed except in "Enable template". */
  disabled: boolean;

  constructor({
    id,
    name,
    fileTemplateName,
    onlyAsPartOfGroup = false,
    disabled = false,
  }: {
    id: string,
    name: string,
    fileTemplateName: string,
    onlyAsPartOfGroup?: boolean,
    disabled?: boolean,
  }) {
    this.id = id;
    this.name = name;
    this.fileTemplateName = fileTemplateName;
    this.onlyAsPartOfGroup = onlyAsPartOfGroup;
    this.disabled = disabled;
  }
}
