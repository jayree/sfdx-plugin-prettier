/*
 * Copyright (c) 2020, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import prettier from 'prettier';
import Debug from 'debug';
import { SfProjectJson, SfProject, Messages } from '@salesforce/core';
import { env } from '@salesforce/kit';
import { SingleBar as cliProgress } from 'cli-progress';
import ignore from 'ignore';
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-prettier', 'hook');
const debug = Debug('prettierFormat:hook');
const isContentTypeJSON = env.getString('SFDX_CONTENT_TYPE', '').toUpperCase() === 'JSON';
const isOutputEnabled = !(process.argv.find((arg) => arg === '--json') ?? isContentTypeJSON);
const bar = new cliProgress({
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    format: isOutputEnabled ? 'prettier | {bar} | {value}/{total} Files' : '',
    noTTYOutput: isOutputEnabled ? true : false,
    stream: process.stdout,
});
async function getCurrentStateFolderFilePath(projectPath, file, migrate) {
    const sfdxPath = join(projectPath, '.sfdx', file);
    const sfPath = join(projectPath, '.sf', file);
    if (!(await fs.pathExists(sfPath))) {
        if (await fs.pathExists(join(projectPath, '.gitignore'))) {
            const gitIgnore = ignore().add(Buffer.from(await fs.readFile(join(projectPath, '.gitignore'))).toString());
            if (!gitIgnore.ignores(join('.sf', file))) {
                if (gitIgnore.ignores(join('.sfdx', file))) {
                    debug('use sfdx state folder');
                    return sfdxPath;
                }
            }
        }
        if (await fs.pathExists(sfdxPath)) {
            if (migrate) {
                debug(`migrate '${file}' to '.sf' state folder`);
                await fs.copy(sfdxPath, sfPath);
            }
            else {
                debug('use sfdx state folder');
                return sfdxPath;
            }
        }
    }
    debug('use sf state folder');
    return sfPath;
}
export const prettierFormat = async function (options) {
    debug(`called 'prettier:prettierFormat' by: ${options.Command?.id}`);
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
    const projectPath = await SfProject.resolveProjectPath();
    const projectJson = new SfProjectJson(SfProjectJson.getDefaultOptions());
    await projectJson.read();
    const isEnabled = projectJson.get('plugins')?.['sfdx-plugin-prettier']?.enabled;
    const configPath = await getCurrentStateFolderFilePath(projectPath, 'sfdx-plugin-prettier-config', true);
    const writeConfig = !(await fs.pathExists(configPath));
    if (isEnabled === undefined) {
        if (writeConfig) {
            const pluginsProperties = projectJson.get('plugins') ?? {};
            pluginsProperties['sfdx-plugin-prettier'] = { enabled: false };
            projectJson.set('plugins', pluginsProperties);
            await projectJson.write();
            await fs.ensureFile(configPath);
        }
    }
    if (!isEnabled) {
        debug('enabled: false');
        process.once('beforeExit', () => {
            debug('beforeExit');
            if (writeConfig) {
                // eslint-disable-next-line no-console
                console.error(messages.getMessage('enablePlugin'));
                void fs.ensureFile(configPath);
            }
        });
        return;
    }
    const config = await prettier.resolveConfigFile(projectPath);
    const ignorePath = join(projectPath, '.prettierignore');
    bar.start(files.length, 0);
    for await (const [i, filepath] of files.entries()) {
        bar.update(i + 1);
        try {
            if (await fs.pathExists(filepath)) {
                const fileInfo = await prettier.getFileInfo(filepath, {
                    ignorePath,
                    resolveConfig: true,
                });
                if (!fileInfo.ignored && fileInfo.inferredParser !== null) {
                    const prettierOptions = {
                        ...(await prettier.resolveConfig(filepath, {
                            config: config ?? undefined,
                            editorconfig: true,
                        })),
                        filepath,
                    };
                    debug({ filepath, fileInfo, prettierOptions });
                    const contents = await fs.readFile(filepath, 'utf8');
                    const formatted = await prettier.format(contents, prettierOptions);
                    if (contents !== formatted) {
                        await fs.writeFile(filepath, formatted);
                    }
                }
            }
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            const message = `${filepath}: ${error.message}`;
            // eslint-disable-next-line no-console, no-unused-expressions
            isOutputEnabled ? console.log(`\n${message}`) : console.error(`prettier - ${message}`);
        }
    }
    bar.stop();
};
//# sourceMappingURL=hook.js.map