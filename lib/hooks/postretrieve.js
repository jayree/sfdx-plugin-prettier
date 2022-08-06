"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postretrieve = exports.ComponentStatus = void 0;
const kit_1 = require("@salesforce/kit");
const debug_1 = require("debug");
const debug = (0, debug_1.debug)('prettierFormat:postretrieve');
var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["Failed"] = "Failed";
})(ComponentStatus = exports.ComponentStatus || (exports.ComponentStatus = {}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFileResponseArray(array) {
    return (Array.isArray(array) && array.some((element) => element.state !== undefined));
}
// eslint-disable-next-line @typescript-eslint/require-await
const postretrieve = async function (options) {
    debug(`called 'prettier:postretrieve' by: ${options.Command.id}`);
    if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
        return;
    }
    if (kit_1.env.getBoolean('SFDX_DISABLE_PRETTIER')) {
        debug('found: SFDX_DISABLE_PRETTIER=true');
        return;
    }
    if (!isFileResponseArray(options.result)) {
        debug('options.result is not FileResponseArray');
        return;
    }
    process.once('beforeExit', () => {
        debug('beforeExit');
        void this.config.runHook('prettierFormat', {
            ...options,
            result: options.result
                .filter((el) => el.state !== ComponentStatus.Failed)
                .map((el) => el.filePath)
                .filter(Boolean),
        });
    });
};
exports.postretrieve = postretrieve;
//# sourceMappingURL=postretrieve.js.map