import { ExtensionContext } from 'vscode';

/** Reference to the current extension context, so it can be accessed anywhere. */
let extensionContext: ExtensionContext | null = null;

/**
 * Set the current extension context.
 * This is done when the extension is activated.
 *
 * @param extContext - Current extension context.
 */
export function setExtensionContext(extContext: ExtensionContext | null): void {
  extensionContext = extContext;
}

/**
 * Get the current extension context.
 * In reality, it's never supposed to be null.
 * The error is thrown so we are able to exit early where we need it.
 */
export function getExtensionContext(): ExtensionContext {
  if (!extensionContext) {
    throw Error('Extension context is not set (this should never happen).');
  }

  return extensionContext;
}
