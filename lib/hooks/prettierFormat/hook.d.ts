import { Hook, Command } from '@oclif/core';
type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;
type HookOptions = {
    Command?: Command;
    result: string[];
};
export declare const prettierFormat: HookFunction;
export {};
