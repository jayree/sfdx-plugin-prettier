import { env } from '@salesforce/kit';
import Debug from 'debug';
const debug = Debug('prettierFormat:postretrieve');
export var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["Failed"] = "Failed";
})(ComponentStatus || (ComponentStatus = {}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFileResponseArray(array) {
    return (Array.isArray(array) && array.some((element) => element.state !== undefined));
}
// eslint-disable-next-line @typescript-eslint/require-await
export const postretrieve = async function (options) {
    debug(`called 'prettier:postretrieve' by: ${options.Command.id}`);
    if (!['force:source:retrieve', 'force:source:pull'].includes(options.Command.id)) {
        return;
    }
    if (env.getBoolean('SFDX_DISABLE_PRETTIER')) {
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
//# sourceMappingURL=postretrieve.js.map