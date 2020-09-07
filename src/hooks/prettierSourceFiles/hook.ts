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
// import * as execa from 'execa';
// import ignore from 'ignore';
import cli from 'cli-ux';
import { SfdxProject } from '@salesforce/core';

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command?: Command.Class;
  result: string[];
};

const debug = Debug('prettierSourceFiles');

const bar = cli.progress({
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  format: 'prettier | {bar} | {value}/{total} Files',
  stream: process.stdout,
});

export const hook: HookFunction = async function (options: HookOptions) {
  debug(`called by: ${options.Command.id}`);
  if (!Array.isArray(options.result)) {
    debug({ result: options.result });
    debug('options.result is not an array of file paths - exit');
    return;
  }
  /*   const SupportedExt = prettier
    .getSupportInfo()
    .languages.reduce((prev, lang) => prev.concat(lang.extensions || []) as [], []); */

  // SupportedExt.push('.cmp');

  // debug({ SupportedExt: JSON.stringify(SupportedExt) });

  const projectPath = await SfdxProject.resolveProjectPath();

  /*   let prettierIgnore = path.join(projectPath, '.prettierignore');
  if (await fs.exists(prettierIgnore)) {
    prettierIgnore = await fs.readFile(prettierIgnore, 'utf8');
  } else {
    prettierIgnore = await fs.readFile(`${path.join(__dirname, '../../../defaultconfig/prettierignore')}`, 'utf8');
  }
  debug({ prettierIgnore }); */

  const files = [...new Set(options.result)] as string[];
  // .filter((file) => SupportedExt.includes(path.extname(file)) as boolean)
  // .map((file) => path.relative(projectPath, file));
  // .filter(ignore().add(prettierIgnore).createFilter());
  debug({ files });
  /*   const config =
    (await prettier.resolveConfigFile(projectPath)) || `${path.join(__dirname, '../../../defaultconfig/prettierrc')}`; */

  const config = await prettier.resolveConfigFile(projectPath);
  const ignorePath = path.join(projectPath, '.prettierignore');

  bar.start(files.length, 0);
  for (const [i, filePath] of files.entries()) {
    // const fullFilePath = path.join(projectPath, filePath);
    // const fullFilePath = filePath;
    bar.update(i + 1);
    if (await fs.exists(filePath)) {
      const fileInfo = await prettier.getFileInfo(filePath, {
        ignorePath,
        resolveConfig: true,
      });
      if (!fileInfo.ignored && fileInfo.inferredParser !== null) {
        const prettierOptions = Object.assign(
          {},
          await prettier.resolveConfig(filePath, {
            config,
            editorconfig: true,
          }),
          { filepath: filePath }
        );
        debug({ filePath, fileInfo, prettierOptions });
        const contents = await fs.readFile(filePath, 'utf8');
        const formatted = prettier.format(contents, prettierOptions);
        if (contents !== formatted) {
          await fs.writeFile(filePath, formatted);
        }
      }
    }
  }
  bar.stop();
};
