/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as fs from 'fs-extra';
import { Hook } from '@oclif/config';
import * as prettier from 'prettier';
import * as Debug from 'debug';
import * as execa from 'execa';
import ignore from 'ignore';

const debug = Debug('prettierSourceFiles');

export const postsourceupdate: Hook<'postsourceupdate'> = async function () {
  const SupportedExt = prettier
    .getSupportInfo()
    .languages.reduce((prev, lang) => prev.concat(lang.extensions || []) as [], []);

  let prettierIgnore = '.prettierignore';
  if (await fs.exists(prettierIgnore)) {
    prettierIgnore = await fs.readFile(prettierIgnore, 'utf8');
  } else {
    prettierIgnore = await fs.readFile(`${path.join(__dirname, '../../defaultconfig/prettierignore')}`, 'utf8');
  }
  debug({ prettierIgnore });

  /*   await fs.writeFile(
    path.join(process.cwd(), 'test.json'),
    JSON.stringify(
      Object.values((options as any).result)
        .map((e) => (e as any).workspaceElements)
        .flat()
    )
  ); */

  /*   let files = Object.values((options as any).result)
    .map((e) => (e as any).workspaceElements)
    .flat()
    .map((we) => we.sourcePath);

  debug(files);

  files = files.map((p) => path.relative(process.cwd(), p));
  debug(files); */

  const getLines = (result): [] => result.stdout.split('\n') as [];

  let files = [
    ...getLines(await execa('git', ['diff', '--name-only', '--diff-filter=ACMRTUB'])),
    ...getLines(await execa('git', ['diff', '--name-only', '--diff-filter=ACMRTUB', '--cached'])),
  ];

  files = [...new Set(files)]
    .filter((file) => SupportedExt.includes(path.extname(file)) as boolean)
    .filter(ignore().add(prettierIgnore).createFilter());
  debug({ files });

  const config = (await prettier.resolveConfigFile()) || `${path.join(__dirname, '../../defaultconfig/prettierrc')}`;

  for (const filePath of files) {
    const prettierOptions = Object.assign(
      {},
      await prettier.resolveConfig(filePath, {
        config,
        editorconfig: true,
      }),
      { filepath: filePath }
    );

    debug({ prettierOptions });
    const contents = await fs.readFile(filePath, 'utf8');
    const formatted = prettier.format(contents, prettierOptions);
    if (contents !== formatted) {
      await fs.writeFile(filePath, formatted);
    }
  }
};
