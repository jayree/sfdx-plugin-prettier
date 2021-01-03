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
const kit_1 = require("@salesforce/kit");
const core_1 = require("@salesforce/core");
const fs = require("fs-extra");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('prettierFormat');
const postsourceupdate = async function (options) {
    var _a;
    debug(`called 'prettier:postsourceupdate' by: ${options.Command.id}`);
    if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
        return;
    }
    if (kit_1.env.getBoolean('SFDX_DISABLE_PRETTIER')) {
        debug('found: SFDX_DISABLE_PRETTIER=true');
        return;
    }
    if (options.result) {
        const projectJson = new core_1.SfdxProjectJson(core_1.SfdxProjectJson.getDefaultOptions());
        await projectJson.read();
        const myplugin = 'sfdx-plugin-prettier';
        const myPluginProperties = projectJson.get('plugins') || {};
        const writeConfig = !(await fs.pathExists(path.join(await core_1.SfdxProject.resolveProjectPath(), '.sfdx', 'sfdx-plugin-prettier-config')));
        if (!(typeof myPluginProperties[myplugin] === 'object')) {
            myPluginProperties[myplugin] = { enabled: false };
            if (writeConfig) {
                await projectJson.write(projectJson.set('plugins', myPluginProperties));
                await fs.ensureFile(path.join(await core_1.SfdxProject.resolveProjectPath(), '.sfdx', 'sfdx-plugin-prettier-config'));
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
        const sourcePaths = Object.values(options.result)
            .map((el) => el.workspaceElements)
            .flat()
            .map((el) => el.filePath);
        process.once('beforeExit', () => {
            debug('beforeExit');
            void this.config.runHook('prettierFormat', Object.assign(Object.assign({}, options), { result: sourcePaths }));
        });
    }
};
exports.postsourceupdate = postsourceupdate;
//# sourceMappingURL=postsourceupdate.js.map