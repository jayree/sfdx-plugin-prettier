import { Command, Hook, Config } from '@oclif/core';
declare type HookFunction = (this: Hook.Context, options: HookOptions) => any;
interface FileResponseBase {
    fullName: string;
    type: string;
    filePath?: string;
}
export declare enum ComponentStatus {
    Failed = "Failed"
}
interface FileResponseSuccess extends FileResponseBase {
    state: Exclude<ComponentStatus, ComponentStatus.Failed>;
}
interface FileResponseFailure extends FileResponseBase {
    state: ComponentStatus.Failed;
    lineNumber?: number;
    columnNumber?: number;
    error: string;
    problemType: 'Warning' | 'Error';
}
export declare type FileResponse = FileResponseSuccess | FileResponseFailure;
declare type HookOptions = {
    Command: Command;
    argv: string[];
    commandId: string;
    result: FileResponse[];
    config: Config;
};
export declare const postretrieve: HookFunction;
export {};
