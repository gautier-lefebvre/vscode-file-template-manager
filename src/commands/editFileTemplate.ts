import { openTemplateEditor } from '../domain/editor';
import { getTemplate } from '../domain/templates';
import selectSingleTemplate from './common/selectSingleTemplate';

export default async (): Promise<void> => {
  // Prompt the user to select a template a create one if no templates were found.
  const templateToEdit = await selectSingleTemplate();

  // If no template selected, abort.
  if (!templateToEdit) { return; }

  // Find the template.
  const template = getTemplate(templateToEdit);
  if (!template) {
    // This should not happen.
    // Probably means that a template was removed but not from the template list memento.
    throw new Error(`Template not found: ${templateToEdit}`);
  }

  // Open the template in the editor.
  await openTemplateEditor(template.name, template.ext);
};
