import { QuickPickItem } from 'vscode';

export interface BooleanQuickPickItem extends QuickPickItem {
  value: boolean;
}
