/*
 * Copyright 2026, jayree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* istanbul ignore file */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import printChangeLog from '@jayree/changelog';
import Debug from 'debug';
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
// eslint-disable-next-line @typescript-eslint/require-await
export const changelog = async function () {
    const debug = Debug([this.config.bin, '@jayree/sfdx-plugin-prettier', 'hooks', 'update'].join(':'));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.once('beforeExit', async () => {
        const changes = await printChangeLog(this.config.cacheDir, join(__dirname, '..', '..'), debug);
        if (changes)
            this.log(changes);
    });
};
//# sourceMappingURL=changelog.js.map