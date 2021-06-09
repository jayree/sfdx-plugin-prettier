"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsourceupdate = void 0;
const kit_1 = require("@salesforce/kit");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('prettierFormat:postsourceupdate');
// eslint-disable-next-line @typescript-eslint/require-await
const postsourceupdate = async function (options) {
    debug(`called 'prettier:postsourceupdate' by: ${options.Command.id}`);
    if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
        return;
    }
    if (kit_1.env.getBoolean('SFDX_DISABLE_PRETTIER')) {
        debug('found: SFDX_DISABLE_PRETTIER=true');
        return;
    }
    if (options.result) {
        const sourcePaths = Object.values(options.result)
            .map((el) => el.workspaceElements)
            .flat()
            .map((el) => el.filePath);
        process.once('beforeExit', () => {
            debug('beforeExit');
            void this.config.runHook('prettierFormat', { ...options, result: sourcePaths });
        });
    }
};
exports.postsourceupdate = postsourceupdate;
//# sourceMappingURL=postsourceupdate.js.map