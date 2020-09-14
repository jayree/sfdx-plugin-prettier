"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postrun = void 0;
const kit_1 = require("@salesforce/kit");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('jayree:hooks');
exports.postrun = async function (options) {
    debug(`called 'prettier:postrun' by: ${options.Command.id}`);
    if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
        return;
    }
    if (options.result) {
        if (kit_1.env.getBoolean('SFDX_DISABLE_PRETTIERPOSTRUN')) {
            debug('found: SFDX_DISABLE_PRETTIERPOSTRUN=true');
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