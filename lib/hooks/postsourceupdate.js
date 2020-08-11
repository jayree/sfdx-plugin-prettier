"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsourceupdate = void 0;
/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const path = require("path");
const fs = require("fs-extra");
const prettier = require("prettier");
const Debug = require("debug");
const execa = require("execa");
const ignore_1 = require("ignore");
const debug = Debug('prettierSourceFiles');
exports.postsourceupdate = async function () {
    const SupportedExt = prettier
        .getSupportInfo()
        .languages.reduce((prev, lang) => prev.concat(lang.extensions || []), []);
    let prettierIgnore = '.prettierignore';
    if (await fs.exists(prettierIgnore)) {
        prettierIgnore = await fs.readFile(prettierIgnore, 'utf8');
    }
    else {
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
    const getLines = (result) => result.stdout.split('\n');
    let files = [
        ...getLines(await execa('git', ['diff', '--name-only', '--diff-filter=ACMRTUB'])),
        ...getLines(await execa('git', ['diff', '--name-only', '--diff-filter=ACMRTUB', '--cached'])),
    ];
    files = [...new Set(files)]
        .filter((file) => SupportedExt.includes(path.extname(file)))
        .filter(ignore_1.default().add(prettierIgnore).createFilter());
    debug({ files });
    const config = (await prettier.resolveConfigFile()) || `${path.join(__dirname, '../../defaultconfig/prettierrc')}`;
    for (const filePath of files) {
        const prettierOptions = Object.assign({}, await prettier.resolveConfig(filePath, {
            config,
            editorconfig: true,
        }), { filepath: filePath });
        debug({ prettierOptions });
        const contents = await fs.readFile(filePath, 'utf8');
        const formatted = prettier.format(contents, prettierOptions);
        if (contents !== formatted) {
            await fs.writeFile(filePath, formatted);
        }
    }
};
//# sourceMappingURL=postsourceupdate.js.map