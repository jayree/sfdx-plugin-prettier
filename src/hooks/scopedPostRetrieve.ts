/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Command, Hook, Config } from '@oclif/core';
import Debug from 'debug';
import { ComponentStatus, ScopedPostRetrieve } from '@salesforce/source-deploy-retrieve';
import { env } from '@salesforce/kit';

const debug = Debug('prettierFormat:postretrieve');

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: ScopedPostRetrieve;
  config: Config;
};

// eslint-disable-next-line @typescript-eslint/require-await
export const scopedPostRetrieve: HookFunction = async function (options) {
  debug(`called 'prettier:scopedPostRetrieve' by: ${options.Command.id}`);

  if (env.getBoolean('SFDX_DISABLE_PRETTIER')) {
    debug('found: SFDX_DISABLE_PRETTIER=true');
    return;
  }

  if (!options.result?.retrieveResult.response.status) {
    return;
  }

  process.once('beforeExit', () => {
    debug('beforeExit');
    void this.config.runHook('prettierFormat', {
      ...options,
      result: options.result?.retrieveResult
        .getFileResponses()
        .filter((el) => el.state !== ComponentStatus.Failed)
        .map((el) => el.filePath)
        .filter(Boolean),
    });
  });
};
