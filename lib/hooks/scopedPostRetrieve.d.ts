import { Command, Hook, Config } from '@oclif/core';
import { ScopedPostRetrieve } from '@salesforce/source-deploy-retrieve';
type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;
type HookOptions = {
    Command: Command;
    argv: string[];
    commandId: string;
    result?: ScopedPostRetrieve;
    config: Config;
};
export declare const scopedPostRetrieve: HookFunction;
export {};
