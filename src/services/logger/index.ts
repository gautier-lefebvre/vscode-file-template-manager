import { window } from 'vscode';

import { OUTPUT_CHANNEL_NAME } from '../../constants';

export const logger = window.createOutputChannel(OUTPUT_CHANNEL_NAME);
