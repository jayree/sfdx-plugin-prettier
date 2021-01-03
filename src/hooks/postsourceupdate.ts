/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { Command, Hook, IConfig } from '@oclif/config';
import { env } from '@salesforce/kit';
import { SfdxProjectJson, SfdxProject } from '@salesforce/core';
import * as fs from 'fs-extra';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result?: PostSourceUpdateResult;
  config: IConfig;
};

type PostSourceUpdateResult = {
  [aggregateName: string]: {
    workspaceElements: Array<{
      fullName: string;
      metadataName: string;
      filePath: string;
      state: string;
      deleteSupported: boolean;
    }>;
  };
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('prettierFormat');

export const postsourceupdate: HookFunction = async function (options) {
  debug(`called 'prettier:postsourceupdate' by: ${options.Command.id}`);
  if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
    return;
  }
  if (env.getBoolean('SFDX_DISABLE_PRETTIER')) {
    debug('found: SFDX_DISABLE_PRETTIER=true');
    return;
  }
  if (options.result) {
    const projectJson = new SfdxProjectJson(SfdxProjectJson.getDefaultOptions());
    await projectJson.read();
    const myplugin = 'sfdx-plugin-prettier';
    const myPluginProperties = projectJson.get('plugins') || {};
    const writeConfig = !(await fs.pathExists(
      path.join(await SfdxProject.resolveProjectPath(), '.sfdx', 'sfdx-plugin-prettier-config')
    ));
    if (!(typeof myPluginProperties[myplugin] === 'object')) {
      myPluginProperties[myplugin] = { enabled: false };
      if (writeConfig) {
        await projectJson.write(projectJson.set('plugins', myPluginProperties));
        await fs.ensureFile(path.join(await SfdxProject.resolveProjectPath(), '.sfdx', 'sfdx-plugin-prettier-config'));
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
    const sourcePaths = Object.values(options.result)
      .map((el) => el.workspaceElements)
      .flat()
      .map((el) => el.filePath);

    process.once('beforeExit', () => {
      debug('beforeExit');
      void this.config.runHook('prettierFormat', { ...options, result: sourcePaths });
    });
  }
};
