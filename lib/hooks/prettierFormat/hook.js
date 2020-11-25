"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettierFormat = void 0;
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
const cli_ux_1 = require("cli-ux");
const core_1 = require("@salesforce/core");
const kit_1 = require("@salesforce/kit");
const debug = Debug('prettierFormat');
const isContentTypeJSON = kit_1.env.getString('SFDX_CONTENT_TYPE', '').toUpperCase() === 'JSON';
const isOutputEnabled = !(process.argv.find((arg) => arg === '--json') || isContentTypeJSON);
const noProgress = {
    start: () => {
        return;
    },
    update: () => {
        return;
    },
    stop: () => {
        return;
    },
};
const bar = isOutputEnabled
    ? cli_ux_1.default.progress({
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        format: 'prettier | {bar} | {value}/{total} Files',
    })
    : noProgress;
const prettierFormat = async function (options) {
    debug(`called by: ${options.Command.id}`);
    if (!Array.isArray(options.result)) {
        debug({ result: options.result });
        debug('options.result is not an array of file paths - exit');
        return;
    }
    const projectPath = await core_1.SfdxProject.resolveProjectPath();
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
                    const prettierOptions = Object.assign(Object.assign({}, (await prettier.resolveConfig(filepath, {
                        config,
                        editorconfig: true,
                    }))), { filepath });
                    debug({ filepath, fileInfo, prettierOptions });
                    const contents = await fs.readFile(filepath, 'utf8');
                    const formatted = prettier.format(contents, prettierOptions);
                    if (contents !== formatted) {
                        await fs.writeFile(filepath, formatted);
                    }
                }
            }
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            cli_ux_1.default.log('\n' + filepath + ': ' + error.message);
        }
    }
    bar.stop();
};
exports.prettierFormat = prettierFormat;
//# sourceMappingURL=hook.js.map