/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook } from '@oclif/config';
import * as Debug from 'debug';
import { env } from '@salesforce/kit';

const debug = Debug('prettierFormat');

export const postrun: Hook<'postrun'> = async function (options) {
  if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
    return;
  }
  if (options.result) {
    if (env.getBoolean('SFDX_DISABLE_PRETTIERPOSTRUN')) {
      debug('SFDX_DISABLE_PRETTIERPOSTRUN=true');
      return;
    }
    options.result = Object.values(options.result)
      .flat()
      .filter((e: Record<string, string>) => e.filePath)
      .map((e: Record<string, string>) => e.filePath);

    await this.config.runHook('prettierFormat', options);
  }
};
