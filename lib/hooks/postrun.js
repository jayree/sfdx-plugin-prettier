"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postrun = void 0;
const kit_1 = require("@salesforce/kit");
const core_1 = require("@salesforce/core");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('jayree:hooks');
exports.postrun = async function (options) {
    debug(`called 'prettier:postrun' by: ${options.Command.id}`);
    if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
        return;
    }
    if (kit_1.env.getBoolean('SFDX_DISABLE_PRETTIERPOSTRUN')) {
        debug('found: SFDX_DISABLE_PRETTIERPOSTRUN=true');
        return;
    }
    if (options.result) {
        const projectJson = new core_1.SfdxProjectJson(core_1.SfdxProjectJson.getDefaultOptions());
        await projectJson.read();
        const myplugin = 'sfdx-plugin-prettier';
        const myPluginProperties = projectJson.get('plugins') || {};
        if (!(typeof myPluginProperties[myplugin] === 'object')) {
            myPluginProperties[myplugin] = { enabled: false };
            await projectJson.write(projectJson.set('plugins', myPluginProperties));
            console.error("enable 'sfdx-plugin-prettier' by setting 'enabled' to 'true' in 'sfdx-project.json'");
        }
        if (!myPluginProperties[myplugin]['enabled']) {
            debug('enabled: false');
            return;
        }
        options.result = Object.values(options.result)
            .flat()
            .filter((e) => e.filePath)
            .map((e) => e.filePath);
        await this.config.runHook('prettierFormat', options);
    }
};
//# sourceMappingURL=postrun.js.map