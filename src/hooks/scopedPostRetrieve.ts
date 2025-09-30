/*
 * Copyright 2025, jayree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
  debug(`called 'prettier:scopedPostRetrieve' by: ${options.Command.id as string}`);

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
