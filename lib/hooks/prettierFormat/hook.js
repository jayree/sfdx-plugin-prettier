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
const core_1 = require("@salesforce/core");
const kit_1 = require("@salesforce/kit");
const cli_progress_1 = require("cli-progress");
const debug = Debug('prettierFormat:hook');
const isContentTypeJSON = kit_1.env.getString('SFDX_CONTENT_TYPE', '').toUpperCase() === 'JSON';
const isOutputEnabled = !(process.argv.find((arg) => arg === '--json') || isContentTypeJSON);
const bar = new cli_progress_1.SingleBar({
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    format: isOutputEnabled ? 'prettier | {bar} | {value}/{total} Files' : '',
    noTTYOutput: isOutputEnabled ? true : false,
    stream: process.stdout,
});
const prettierFormat = async function (options) {
    var _a;
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
    const projectPath = await core_1.SfdxProject.resolveProjectPath();
    const projectJson = new core_1.SfdxProjectJson(core_1.SfdxProjectJson.getDefaultOptions());
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
    if (!((_a = myPluginProperties[myplugin]) === null || _a === void 0 ? void 0 : _a.enabled)) {
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
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            const message = `${filepath}: ${error.message}`;
            // eslint-disable-next-line no-unused-expressions
            isOutputEnabled ? console.log(`\n${message}`) : console.error(`prettier - ${message}`);
        }
    }
    bar.stop();
};
exports.prettierFormat = prettierFormat;
//# sourceMappingURL=hook.js.map