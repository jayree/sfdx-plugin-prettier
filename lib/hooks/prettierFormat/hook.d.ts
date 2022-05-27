import { Hook, Command } from '@oclif/core';
declare type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;
declare type HookOptions = {
    Command?: Command;
    result: string[];
};
export declare const prettierFormat: HookFunction;
export {};
