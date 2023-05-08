import Debug from 'debug';
import { ComponentStatus } from '@salesforce/source-deploy-retrieve';
import { env } from '@salesforce/kit';
const debug = Debug('prettierFormat:postretrieve');
// eslint-disable-next-line @typescript-eslint/require-await
export const scopedPostRetrieve = async function (options) {
    debug(`called 'prettier:scopedPostRetrieve' by: ${options.Command.id}`);
    if (env.getBoolean('SFDX_DISABLE_PRETTIER')) {
        debug('found: SFDX_DISABLE_PRETTIER=true');
        return;
    }
    if (!options.result?.retrieveResult.response.status) {
        return;
    }
    process.once('beforeExit', () => {
        debug('beforeExit');
        void this.config.runHook('prettierFormat', {
            ...options,
            result: options.result?.retrieveResult
                .getFileResponses()
                .filter((el) => el.state !== ComponentStatus.Failed)
                .map((el) => el.filePath)
                .filter(Boolean),
        });
    });
};
//# sourceMappingURL=scopedPostRetrieve.js.map