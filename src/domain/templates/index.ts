import { TextDecoder, TextEncoder } from 'util';

import { ExtensionContext } from 'vscode';

import { MEMENTO_GROUPS_KEY, MEMENTO_LIST_KEY, MEMENTO_TEMPLATE_PREFIX } from '../../config/constants';

/**
 * Templates persistence consists of 3 things:
 * - Each template is saved under a 'template-TEMPLATE_NAME' key in the globalState Memento object.
 *   Inside the globalState, template are serialized (RawTemplate), and they are manually
 *   deserialized when fetching them from the globalState (Template).
 * - Since there is no way to list all keys inside the globalState object, I keep a ledger of all
 *   templates inside the globalState, under the 'templates-list' key. It's a simple list of the
 *   keys of all templates.
 * - A ledger of all template groups. It is a simple map 'group name -> template names'. When a
 *   template is removed, it is also removed from all groups it was a part of.
 */

// Current extension context.
let extensionContext: ExtensionContext | null = null;

/** Template when serialized by VSCode globalState. */
type RawTemplate = {
  name: string;
  ext: string;
  content: string;
  ctime: number;
  mtime: number;
};

/** Template when deserialized (used inside the extension). */
class Template {
  /** Name of the template. e.g. "React Component". */
  name: string;

  /** File extension of the template. e.g. ".jsx". */
  ext: string;

  /** Content of the template, to load when creating a file from a template. */
  content: Uint8Array;

  /** Creation timestamp. */
  ctime: number;

  /** Last modification timestamp. */
  mtime: number;

  constructor({
    name,
    ext = '',
    content = new Uint8Array(),
    ctime = Date.now(),
    mtime = Date.now(),
  }: {
    name: string,
    ext: string,
    content?: Uint8Array,
    ctime?: number,
    mtime?: number,
  }) {
    this.name = name;
    this.ext = ext;
    this.content = content;
    this.ctime = ctime;
    this.mtime = mtime;
  }

  /** Serialize the template to persist in global state. */
  toJSON(): RawTemplate {
    return {
      name: this.name,
      ext: this.ext,
      content: new TextDecoder('utf-8').decode(this.content),
      ctime: this.ctime,
      mtime: this.mtime,
    };
  }
}

/**
 * Set the current extension context. We need the extension context state to persist templates.
 * @param extContext - The current extension context given by VSCode to the activate method.
 */
export function setExtensionContext(extContext: ExtensionContext | null): void {
  extensionContext = extContext;
}

/**
 * Persist the template list.
 * @param list - List of persisted template names.
 */
function setTemplateList(list: Array<string>): Promise<void> {
  if (!extensionContext) {
    // This should never happen.
    throw Error('Extension context is undefined');
  }

  await extensionContext.globalState.update(MEMENTO_LIST_KEY, list);
}

/**
 * Persist a template.
 * @param name - Template name.
 * @param value - New template value. Use undefined to unset.
 */
async function setTemplate(name: string, value: Template | undefined): Promise<void> {
  if (!extensionContext) {
    // This should never happen.
    throw Error('Extension context is undefined');
  }

  // Template are saved under the 'template-TEMPLATE_NAME' key, so it never conflicts with
  // the list or groups keys (templates-list and templates-groups).
  await extensionContext.globalState.update(`${MEMENTO_TEMPLATE_PREFIX}${name}`, value);
}

/**
 * Unpersist a template.
 * @param name - Template name.
 */
function unsetTemplate(name: string) {
  return setTemplate(name, undefined);
}

/**
 * Get and deserialize an existing template.
 *
 * @param name - Template name.
 * @returns The template, or null if not found.
 */
export function getTemplate(name: string): Template | null {
  if (!extensionContext) {
    // This should never happen.
    throw Error('Extension context is undefined');
  }

  const key = `${MEMENTO_TEMPLATE_PREFIX}${name}`;
  const rawTemplate = extensionContext.globalState.get(key) as RawTemplate;

  // If the template was not in the globalState, it does not exist.
  if (!rawTemplate) {
    return null;
  }

  // Deserialize the template manually.
  const template = new Template({
    name: rawTemplate.name,
    ext: rawTemplate.ext,
    content: new TextEncoder().encode(rawTemplate.content),
    ctime: rawTemplate.ctime,
    mtime: rawTemplate.mtime,
  });

  return template;
}

/**
 * List the names of all created templates.
 */
export function listTemplates(): Array<string> {
  if (!extensionContext) {
    // This should never happen.
    throw Error('Extension context is undefined');
  }

  return extensionContext.globalState.get(MEMENTO_LIST_KEY) || [];
}

/**
 * Get the templates groups map.
 */
export function getTemplateGroups(): Record<string, string[]> {
  if (!extensionContext) {
    // This should never happen.
    throw Error('Extension context is undefined');
  }

  return extensionContext.globalState.get(MEMENTO_GROUPS_KEY) || {};
}

/**
 * Get the template groups names list.
 */
export function getTemplateGroupsNames(): string[] {
  return Object.keys(getTemplateGroups());
}

/**
 * Get the templates of a template group.
 * @param name - Name of the template group.
 * @returns The name of each template of the group, or undefined if the group does not exist.
 */
export function getTemplateGroupTemplates(name: string): Array<string> | undefined {
  return getTemplateGroups()[name];
}

/**
 * Persist updated template groups.
 * @param groups - New template groups.
 */
export async function setTemplateGroups(groups: Record<string, string[]>): Promise<void> {
  if (!extensionContext) {
  // This should never happen.
    throw Error('Extension context is undefined');
  }

  await extensionContext.globalState.update(MEMENTO_GROUPS_KEY, groups);
}

/**
 * Create a new template group. This does not check that the template group does not exist yet.
 * @param groupName - Name of the group.
 * @param templates - Name of the templates to add to the group.
 */
export function createTemplateGroup(groupName: string, templates: string[]): Promise<void> {
  const groups = { ...getTemplateGroups() };
  groups[groupName] = templates;
  return setTemplateGroups(groups);
}

/**
 * Edit a template group. This does the exact same thing as creating a template group.
 */
export const editTemplateGroup = createTemplateGroup;

/**
 * Remove a template group.
 * @param groupName - Name of the template to remove.
 */
export function removeTemplateGroup(groupName: string): Promise<void> {
  const groups = { ...getTemplateGroups() };
  delete groups[groupName];
  return setTemplateGroups(groups);
}

/**
 * Create a template. Will overwrite an existing template.
 *
 * @param name - Template name.
 * @param ext - Template file extension.
 */
export async function createTemplate(name: string, ext: string): Promise<Template> {
  const template = new Template({ name, ext });

  await Promise.all([
    // Save the template.
    setTemplate(name, template),
    // Add the template to the ledger. Use a Set to prevent any duplicates.
    setTemplateList([...new Set([...listTemplates(), name])]),
  ]);

  return template;
}

/**
 * Update a template.
 * @param name - Template name.
 * @param content - Template content.
 */
export function updateTemplate(name: string, content: Uint8Array): Promise<void> {
  const template = getTemplate(name);

  if (!template) {
    // This should never happen.
    throw Error(`Template not found: ${name}`);
  }

  // Update the content and last modification time.
  template.content = content;
  template.mtime = Date.now();

  // Persist.
  return setTemplate(name, template);
}

/**
 * Remove a template.
 * @param name - Name of template to remove.
 */
export async function removeTemplate(name: string): Promise<[void, void, void]> {
  // Use a set to delete more easily.
  const templates = new Set(listTemplates());
  templates.delete(name);

  // Remove the template from any group it is a part of.
  const templateGroups = getTemplateGroups();
  const newTemplateGroups = Object.keys(templateGroups).reduce(
    (acc: Record<string, string[]>, groupName: string) => {
      acc[groupName] = templateGroups[groupName].filter((templateName) => templateName !== name);
      return acc;
    },
    {},
  );

  // Persist the ledger, groups and remove the template.
  return Promise.all([
    setTemplateGroups(newTemplateGroups),
    setTemplateList([...templates]),
    unsetTemplate(name),
  ]);
}
