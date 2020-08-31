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
// import * as execa from 'execa';
import ignore from 'ignore';
import cli from 'cli-ux';

const debug = Debug('prettierSourceFiles');

const bar = cli.progress({
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  format: 'prettier | {bar} | {value}/{total} Files',
  stream: process.stdout,
});

export const postrun: Hook<'postrun'> = async function (options) {
  if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
    return;
  }
  const SupportedExt = prettier
    .getSupportInfo()
    .languages.reduce((prev, lang) => prev.concat(lang.extensions || []) as [], []);

  SupportedExt.push('.cmp');

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

  /*   let files = Object.values(options['result'])
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .map((e) => e['workspaceElements'])
    .flat()
    .map((we) => we['sourcePath'] as string);

  files = files.map((p) => path.relative(process.cwd(), p)); */

  /*   const getLines = (result): [] => result.stdout.split('\n') as [];

  let files = [
    ...getLines(await execa('git', ['diff', '--name-only', '--diff-filter=ACMRTUB'])),
    ...getLines(await execa('git', ['diff', '--name-only', '--diff-filter=ACMRTUB', '--cached'])),
  ]; */

  let files = Object.values(options.result)
    .flat()
    .filter((e: Record<string, string>) => e.filePath)
    .map((e: Record<string, string>) => e.filePath);

  // console.log(files.filter((f) => f.includes('reportFolder')));

  /*  const folderworkaround = files
    .filter((f) => f.endsWith('.report-meta.xml') && !f.includes('unfiled$public'))
    .map((r) => {
      const split = r.split('/');
      const foldername = split[split.length - 2];
      return path.join(...split.splice(0, split.length - 2), `${foldername}.reportFolder-meta.xml`);
    });
  console.log([...new Set(folderworkaround)]); */

  // files = [...new Set(files), ...new Set(folderworkaround)]
  files = [...new Set(files)]
    .filter((file) => SupportedExt.includes(path.extname(file)) as boolean)
    .filter(ignore().add(prettierIgnore).createFilter());
  debug({ files });

  const config = (await prettier.resolveConfigFile()) || `${path.join(__dirname, '../../defaultconfig/prettierrc')}`;

  bar.start(files.length, 0);
  for (const [i, filePath] of files.entries()) {
    bar.update(i + 1);
    if (await fs.exists(filePath)) {
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
  }
  bar.stop();
};
