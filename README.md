# @jayree/sfdx-plugin-prettier

A Salesforce CLI plugin containing a hook that uses prettier to format Salesforce metadata source files retrieved or pulled from Salesforce orgs.

[![sfdx](https://img.shields.io/badge/cli-sfdx-brightgreen.svg)](https://developer.salesforce.com/tools/sfdxcli)
[![Version](https://img.shields.io/npm/v/@jayree/sfdx-plugin-prettier.svg)](https://npmjs.org/package/@jayree/sfdx-plugin-prettier)
[![test-and-release](https://github.com/jayree/sfdx-plugin-prettier/actions/workflows/release.yml/badge.svg)](https://github.com/jayree/sfdx-plugin-prettier/actions/workflows/release.yml)
[![Downloads/week](https://img.shields.io/npm/dw/@jayree/sfdx-plugin-prettier.svg)](https://npmjs.org/package/@jayree/sfdx-plugin-prettier)
[![License](https://img.shields.io/npm/l/@jayree/sfdx-plugin-prettier.svg)](https://github.com/jayree-plugins/sfdx-plugin-prettier/blob/main/package.json)


`sfdx-plugin-prettier` is an [sfdx](https://developer.salesforce.com/tools/sfdxcli) plugin to format Salesforce metadata source files. It is triggered by the [postsourceupdate](https://github.com/forcedotcom/cli/blob/master/releasenotes/README.md#4950-august-6-2020) hook after running `force:source:retrieve` or `force:source:pull`.

<!-- toc -->
* [@jayree/sfdx-plugin-prettier](#jayreesfdx-plugin-prettier)
<!-- tocstop -->

## Install

<!-- usage -->
```sh-session
$ npm install -g @jayree/sfdx-plugin-prettier
$ sfdx COMMAND
running command...
$ sfdx (--version)
@jayree/sfdx-plugin-prettier/1.3.12 linux-x64 node-v18.16.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->

## Usage

Use `force:source:retrieve` or `force:source:pull` to tirgger the hook. The formatting is performed on the retrieved source files.

## Configuration and Ignore Files

`sfdx-plugin-prettier` uses the [`.prettierrc`](https://prettier.io/docs/en/configuration), [`.prettierignore`](https://prettier.io/docs/en/ignore#ignoring-files), and [`.editorconfig`](http://editorconfig.org/) files in the sfdx project folder.

When the hook is executed for the first time, a `sfdx-plugin-prettier` setting is added to the `sfdx-project.json` file. Here you can enable or disable the hook by setting `enabled` to `true` or `false` (default). If you want the hook to remain disabled for a project, you can remove the setting again.

```json
{
  "plugins": {
    "sfdx-plugin-prettier": {
      "enabled": true
    }
  }
}
```
