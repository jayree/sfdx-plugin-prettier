"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postrun = void 0;
const Debug = require("debug");
const kit_1 = require("@salesforce/kit");
const debug = Debug('prettierSourceFiles');
exports.postrun = async function (options) {
    if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
        return;
    }
    if (kit_1.env.getBoolean('SFDX_DISABLE_PRETTIERPOSTRUN')) {
        debug('SFDX_DISABLE_PRETTIERPOSTRUN=true');
        return;
    }
    options.result = Object.values(options.result)
        .flat()
        .filter((e) => e.filePath)
        .map((e) => e.filePath);
    await this.config.runHook('prettierSourceFiles', options);
};
//# sourceMappingURL=postrun.js.map