import { Command, Hook } from '@oclif/config';
declare type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;
declare type HookOptions = {
    Command?: Command.Class;
    result: string[];
};
export declare const hook: HookFunction;
export {};
