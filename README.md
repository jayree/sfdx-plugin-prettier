# @jayree/sfdx-plugin-prettier

[![sfdx](https://img.shields.io/badge/cli-sfdx-brightgreen.svg)](https://developer.salesforce.com/tools/sfdxcli)
[![Version](https://img.shields.io/npm/v/@jayree/sfdx-plugin-prettier.svg)](https://npmjs.org/package/@jayree/sfdx-plugin-prettier)
[![CircleCI](https://circleci.com/gh/jayree/sfdx-plugin-prettier/tree/master.svg?style=shield)](https://circleci.com/gh/jayree/sfdx-plugin-prettier/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/jayree/sfdx-plugin-prettier?branch=master&svg=true)](https://ci.appveyor.com/project/jayree/sfdx-plugin-prettier/branch/master)
[![Codecov](https://codecov.io/gh/jayree/sfdx-plugin-prettier/branch/master/graph/badge.svg)](https://codecov.io/gh/jayree/sfdx-plugin-prettier)
[![Downloads/week](https://img.shields.io/npm/dw/@jayree/sfdx-plugin-prettier.svg)](https://npmjs.org/package/@jayree/sfdx-plugin-prettier)
[![License](https://img.shields.io/npm/l/@jayree/sfdx-plugin-prettier.svg)](https://github.com/jayree/sfdx-plugin-prettier/blob/master/package.json)

`sfdx-plugin-prettier` is an [sfdx](https://developer.salesforce.com/tools/sfdxcli) plugin to format Salesforce metadata source files. It is triggered by the [postsourceupdate](https://github.com/forcedotcom/cli/blob/master/releasenotes/README.md#4950-august-6-2020) hook after running `force:source:retrieve` or `force:source:pull`.

<!-- toc -->
* [Install](#install)
* [Usage](#usage)
* [Configuration and Ignore Files](#configuration-and-ignore-files)
<!-- tocstop -->

## Install

<!-- usage -->
```sh-session
$ sfdx plugins:install @jayree/sfdx-plugin-prettier
$ sfdx plugins
@jayree/sfdx-plugin-prettier 1.0.0
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
