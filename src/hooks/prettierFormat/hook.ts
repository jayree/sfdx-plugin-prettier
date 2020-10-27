/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as fs from 'fs-extra';
import { Command, Hook } from '@oclif/config';
import * as prettier from 'prettier';
import * as Debug from 'debug';
import cli from 'cli-ux';
import { SfdxProject } from '@salesforce/core';
import { env } from '@salesforce/kit';

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command?: Command.Class;
  result: string[];
};

const debug = Debug('prettierFormat');

const isContentTypeJSON = env.getString('SFDX_CONTENT_TYPE', '').toUpperCase() === 'JSON';
const isOutputEnabled = !(process.argv.find((arg) => arg === '--json') || isContentTypeJSON);

const noProgress = {
  start: (): void => {
    return;
  },
  update: (): void => {
    return;
  },
  stop: (): void => {
    return;
  },
};

const bar = isOutputEnabled
  ? cli.progress({
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      format: 'prettier | {bar} | {value}/{total} Files',
    })
  : noProgress;

export const prettierFormat: HookFunction = async function (options: HookOptions) {
  debug(`called by: ${options.Command.id}`);
  if (!Array.isArray(options.result)) {
    debug({ result: options.result });
    debug('options.result is not an array of file paths - exit');
    return;
  }

  const projectPath = await SfdxProject.resolveProjectPath();

  const files = options.result;
  debug({ files });

  const config = await prettier.resolveConfigFile(projectPath);
  const ignorePath = path.join(projectPath, '.prettierignore');

  bar.start(files.length, 0);
  for (const [i, filepath] of files.entries()) {
    bar.update(i + 1);
    try {
      if (await fs.exists(filepath)) {
        const fileInfo = await prettier.getFileInfo(filepath, {
          ignorePath,
          resolveConfig: true,
        });
        if (!fileInfo.ignored && fileInfo.inferredParser !== null) {
          const prettierOptions = {
            ...(await prettier.resolveConfig(filepath, {
              config,
              editorconfig: true,
            })),
            filepath,
          };
          debug({ filepath, fileInfo, prettierOptions });
          const contents = await fs.readFile(filepath, 'utf8');
          const formatted = prettier.format(contents, prettierOptions);
          if (contents !== formatted) {
            await fs.writeFile(filepath, formatted);
          }
        }
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      cli.log('\n' + filepath + ': ' + error.message);
    }
  }
  bar.stop();
};
