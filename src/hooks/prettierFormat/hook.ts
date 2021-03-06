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
import { SfdxProjectJson, SfdxProject } from '@salesforce/core';
import { env } from '@salesforce/kit';
import { SingleBar as cliProgress } from 'cli-progress';

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command?: Command.Class;
  result: string[];
};

const debug = Debug('prettierFormat:hook');

const isContentTypeJSON = env.getString('SFDX_CONTENT_TYPE', '').toUpperCase() === 'JSON';
const isOutputEnabled = !(process.argv.find((arg) => arg === '--json') || isContentTypeJSON);

const bar = new cliProgress({
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  format: isOutputEnabled ? 'prettier | {bar} | {value}/{total} Files' : '',
  noTTYOutput: isOutputEnabled ? true : false,
  stream: process.stdout,
});

export const prettierFormat: HookFunction = async function (options: HookOptions) {
  debug(`called 'prettier:prettierFormat' by: ${options.Command.id}`);
  if (!Array.isArray(options.result)) {
    debug({ result: options.result });
    debug('options.result is not an array of file paths - exit');
    return;
  }

  const files = options.result;
  debug({ files });

  if (!(files.length > 0)) {
    debug('no files found');
    return;
  }

  const projectPath = await SfdxProject.resolveProjectPath();
  const projectJson = new SfdxProjectJson(SfdxProjectJson.getDefaultOptions());
  await projectJson.read();
  const myplugin = 'sfdx-plugin-prettier';
  const myPluginProperties = projectJson.get('plugins') || {};
  const writeConfig = !(await fs.pathExists(path.join(projectPath, '.sfdx', 'sfdx-plugin-prettier-config')));
  if (!(typeof myPluginProperties[myplugin] === 'object')) {
    myPluginProperties[myplugin] = { enabled: false };
    if (writeConfig) {
      await projectJson.write(projectJson.set('plugins', myPluginProperties));
      await fs.ensureFile(path.join(projectPath, '.sfdx', 'sfdx-plugin-prettier-config'));
    }
  }
  if (!myPluginProperties[myplugin]?.enabled) {
    debug('enabled: false');
    process.once('beforeExit', () => {
      debug('beforeExit');
      if (writeConfig) {
        console.error("enable 'sfdx-plugin-prettier' by setting 'enabled' to 'true' in 'sfdx-project.json'");
      }
    });
    return;
  }

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
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const message = `${filepath}: ${error.message}`;
      // eslint-disable-next-line no-unused-expressions
      isOutputEnabled ? console.log(`\n${message}`) : console.error(`prettier - ${message}`);
    }
  }
  bar.stop();
};
