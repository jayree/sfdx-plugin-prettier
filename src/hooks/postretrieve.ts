/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Command, Hook, Config } from '@oclif/core';
import { env } from '@salesforce/kit';
import { debug as Debug } from 'debug';

const debug = Debug('prettierFormat:postretrieve');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HookFunction = (this: Hook.Context, options: HookOptions) => any;

interface FileResponseBase {
  fullName: string;
  type: string;
  filePath?: string;
}

export enum ComponentStatus {
  Failed = 'Failed',
}

interface FileResponseSuccess extends FileResponseBase {
  state: Exclude<ComponentStatus, ComponentStatus.Failed>;
}

interface FileResponseFailure extends FileResponseBase {
  state: ComponentStatus.Failed;
  lineNumber?: number;
  columnNumber?: number;
  error: string;
  problemType: 'Warning' | 'Error';
}

export type FileResponse = FileResponseSuccess | FileResponseFailure;

type HookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result: FileResponse[];
  config: Config;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFileResponseArray(array: any): array is FileResponse[] {
  return (
    Array.isArray(array as FileResponse[]) && (array as FileResponse[]).some((element) => element.state !== undefined)
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export const postretrieve: HookFunction = async function (options) {
  debug(`called 'prettier:postretrieve' by: ${options.Command.id}`);
  if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
    return;
  }
  if (env.getBoolean('SFDX_DISABLE_PRETTIER')) {
    debug('found: SFDX_DISABLE_PRETTIER=true');
    return;
  }

  if (!isFileResponseArray(options.result)) {
    debug('options.result is not FileResponseArray');
    return;
  }

  process.once('beforeExit', () => {
    debug('beforeExit');
    void this.config.runHook('prettierFormat', {
      ...options,
      result: options.result
        .filter((el) => el.state !== ComponentStatus.Failed)
        .map((el) => el.filePath)
        .filter(Boolean),
    });
  });
};
