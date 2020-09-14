import { removeTemplateGroup } from '../domain/templates';
import selectSingleTemplateGroup from './common/selectSingleTemplateGroup';

export default async () :Promise<void> => {
  // List template groups. If the list is empty, the user is prompted to create one.
  const groupName = await selectSingleTemplateGroup();

  // If the user pressed Esc, abort.
  if (!groupName) { return; }

  // Remove the template group.
  await removeTemplateGroup(groupName);
};
