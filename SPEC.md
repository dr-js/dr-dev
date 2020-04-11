# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)
* [Resource package](#resource-package)

#### Export Path
+ 📄 [source/babel.js](source/babel.js)
  - `getBabelConfig`, `getWebpackBabelConfig`
+ 📄 [source/fileProcessor.js](source/fileProcessor.js)
  - `fileProcessorBabel`, `fileProcessorWebpack`, `processFileList`
+ 📄 [source/license.js](source/license.js)
  - `writeLicenseFile`
+ 📄 [source/main.js](source/main.js)
  - `argvFlag`, `runMain`
+ 📄 [source/minify.js](source/minify.js)
  - `getTerserOption`, `minifyFileListWithTerser`, `minifyWithTerser`
+ 📄 [source/output.js](source/output.js)
  - `clearOutput`, `getPackageTgzName`, `getPublishFlag`, `initOutput`, `packOutput`, `publishOutput`, `verifyGitStatusClean`, `verifyNoGitignore`, `verifyOutputBin`, `verifyPublishVersion`
+ 📄 [source/puppeteer.js](source/puppeteer.js)
  - `clearPuppeteerBrowser`, `clearPuppeteerPage`, `initPuppeteerBrowser`, `initPuppeteerPage`, `runWithPuppeteer`, `testWithPuppeteer`, `wrapTestScriptStringToHTML`
+ 📄 [source/webpack.js](source/webpack.js)
  - `commonFlag`, `compileWithWebpack`
+ 📄 [source/common/dev.js](source/common/dev.js)
  - `createTransformCacheWithInfo`, `hijackSetTimeoutInterval`
+ 📄 [source/common/terminalColor.js](source/common/terminalColor.js)
  - `TerminalColor`, `shouldSupportColor`
+ 📄 [source/common/test.js](source/common/test.js)
  - `TEST_RUN`, `TEST_SETUP`, `after`, `before`, `describe`, `info`, `it`
+ 📄 [source/node/env.js](source/node/env.js)
  - `__VERBOSE__`, `argvFlag`, `checkFlag`, `loadEnvKey`, `saveEnvKey`, `syncEnvKey`
+ 📄 [source/node/file.js](source/node/file.js)
  - `findPathFragList`, `getFileListFromPathList`, `resetDirectory`, `withTempDirectory`
+ 📄 [source/node/filePreset.js](source/node/filePreset.js)
  - `getSourceJsFileListFromPathList`
+ 📄 [source/node/logger.js](source/node/logger.js)
  - `getLogger`
+ 📄 [source/node/preset.js](source/node/preset.js)
  - `FILTER_JS_FILE`, `FILTER_SOURCE_JS_FILE`, `FILTER_SOURCE_PATH`, `FILTER_TEST_JS_FILE`, `FILTER_TEST_PATH`
+ 📄 [source/node/run.js](source/node/run.js)
  - `getGitBranch`, `getGitCommitHash`, `withRunBackground`
+ 📄 [source/node/export/generate.js](source/node/export/generate.js)
  - `EXPORT_HOIST_LIST_KEY`, `EXPORT_LIST_KEY`, `HOIST_LIST_KEY`, `generateExportInfo`, `generateIndexScript`
+ 📄 [source/node/export/parse.js](source/node/export/parse.js)
  - `createExportParser`
+ 📄 [source/node/export/parsePreset.js](source/node/export/parsePreset.js)
  - `collectSourceJsRouteMap`
+ 📄 [source/node/export/renderMarkdown.js](source/node/export/renderMarkdown.js)
  - `escapeMarkdownLink`, `getMarkdownDirectoryLink`, `getMarkdownFileLink`, `getMarkdownHeaderLink`, `renderMarkdownAutoAppendHeaderLink`, `renderMarkdownBlockQuote`, `renderMarkdownExportPath`, `renderMarkdownExportTree`, `renderMarkdownTable`
+ 📄 [source/node/npm/comboCommand.js](source/node/npm/comboCommand.js)
  - `COMBO_COMMAND_CONFIG_MAP`, `comboCommand`
+ 📄 [source/node/npm/npxLazy.js](source/node/npm/npxLazy.js)
  - `npxLazy`, `parsePackageNameAndVersion`, `runNpx`
+ 📄 [source/node/npm/parseScript.js](source/node/npm/parseScript.js)
  - `parseCommand`, `parsePackageScript`, `warpBashSubShell`, `wrapJoinBashArgs`
+ 📄 [source/node/npm/path.js](source/node/npm/path.js)
  - `findUpPackageRoot`, `fromPathGlobalNodeModules`, `getPathGlobalNpmNodeModules`, `tryRequireGlobal`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env" to enable, not using be default
>       from JS/JSON file: set to "path/to/file.config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --debug --D -D [OPTIONAL] [ARGUMENT=0+]
>       more debug log
>   --path-input --i -i [ARGUMENT=1]
>       path to "package.json", or directory with "package.json" inside
>   --pack [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-output [ARGUMENT=1]
>         output path
>     --output-name [ARGUMENT=1]
>         output package name
>     --output-version [ARGUMENT=1]
>         output package version
>     --output-description [ARGUMENT=1]
>         output package description
>     --publish [ARGUMENT=0+]
>         run npm publish
>     --publish-dev [ARGUMENT=0+]
>         run npm publish-dev
>     --dry-run [ARGUMENT=0+]
>         for testing publish procedure
>   --check-outdated --C -C [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-temp [ARGUMENT=1]
>   --step-package-version --S -S [OPTIONAL] [ARGUMENT=0+]
>       step up package version (expect "0.0.0-dev.0-local.0" format)
>     --sort-key --K -K [ARGUMENT=0+]
>         sort keys in package.json
>     --git-commit --G -G [ARGUMENT=0+]
>         step up patch version, and prepare a git commit
>   --test-root --T -T [OPTIONAL] [ARGUMENT=1+]
>       root path to look test file from, default to "."
>     --test-file-suffix --TFS [ARGUMENT=1+]
>         pattern for test file, default to ".js"
>     --test-require --TR [ARGUMENT=1+]
>         module or file to require before test files, mostly for "@babel/register"
>     --test-timeout --TT [ARGUMENT=1]
>         timeout for each test, in msec, default to 10*1000 (10sec)
>   --init --I -I [OPTIONAL] [ARGUMENT=0-1]
>       path for init a package, will not reset existing file, default to "."
>     --init-resource-package --P -P [ARGUMENT=1]
>         path to resource package, default search for "./node_modules/@dr-js/dev-*/"
>     --init-reset --R -R [ARGUMENT=0+]
>         allow init to reset existing file
>     --init-verify --V -V [ARGUMENT=0+]
>         do common init file content check, will skip file modify
>     --init-verify-rule --IVR [ARGUMENT=1+]
>         path to verify rule, default search in "init-resource-package"
>   --parse-script --ps [OPTIONAL] [ARGUMENT=1+]
>       parse and echo: $@=scriptName,...extraArgs
>   --parse-script-list --psl [OPTIONAL] [ARGUMENT=1+]
>       combine multi-script, but no extraArgs: $@=...scriptNameList
>   --run-script --rs [OPTIONAL] [ARGUMENT=1+]
>       parse and run: $@=scriptName,...extraArgs
>   --run-script-list --rsl [OPTIONAL] [ARGUMENT=1+]
>       combine multi-script, but no extraArgs: $@=...scriptNameList
>   --npm-combo --nc --M -M [OPTIONAL] [ARGUMENT=1+]
>       useful npm combo, one of: config|c|install-offline|io|install-clear|ic|package-dedupe|ddp|pd|package-reset|pr
>   --npx-lazy --npx --nl --X -X [OPTIONAL] [ARGUMENT=1+]
>       skip npx re-install if package version fit: $@=package@version,...extraArgs
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_DEV_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_DEV_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_DEBUG="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_INPUT="[ARGUMENT=1]"
>     export DR_DEV_PACK="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_OUTPUT="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_NAME="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_VERSION="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_DESCRIPTION="[ARGUMENT=1]"
>     export DR_DEV_PUBLISH="[ARGUMENT=0+]"
>     export DR_DEV_PUBLISH_DEV="[ARGUMENT=0+]"
>     export DR_DEV_DRY_RUN="[ARGUMENT=0+]"
>     export DR_DEV_CHECK_OUTDATED="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_TEMP="[ARGUMENT=1]"
>     export DR_DEV_STEP_PACKAGE_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_SORT_KEY="[ARGUMENT=0+]"
>     export DR_DEV_GIT_COMMIT="[ARGUMENT=0+]"
>     export DR_DEV_TEST_ROOT="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_TEST_FILE_SUFFIX="[ARGUMENT=1+]"
>     export DR_DEV_TEST_REQUIRE="[ARGUMENT=1+]"
>     export DR_DEV_TEST_TIMEOUT="[ARGUMENT=1]"
>     export DR_DEV_INIT="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_INIT_RESOURCE_PACKAGE="[ARGUMENT=1]"
>     export DR_DEV_INIT_RESET="[ARGUMENT=0+]"
>     export DR_DEV_INIT_VERIFY="[ARGUMENT=0+]"
>     export DR_DEV_INIT_VERIFY_RULE="[ARGUMENT=1+]"
>     export DR_DEV_PARSE_SCRIPT="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_PARSE_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_RUN_SCRIPT="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_RUN_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_NPM_COMBO="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_NPX_LAZY="[OPTIONAL] [ARGUMENT=1+]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "debug": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathInput": [ "[ARGUMENT=1]" ],
>     "pack": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathOutput": [ "[ARGUMENT=1]" ],
>     "outputName": [ "[ARGUMENT=1]" ],
>     "outputVersion": [ "[ARGUMENT=1]" ],
>     "outputDescription": [ "[ARGUMENT=1]" ],
>     "publish": [ "[ARGUMENT=0+]" ],
>     "publishDev": [ "[ARGUMENT=0+]" ],
>     "dryRun": [ "[ARGUMENT=0+]" ],
>     "checkOutdated": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathTemp": [ "[ARGUMENT=1]" ],
>     "stepPackageVersion": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "sortKey": [ "[ARGUMENT=0+]" ],
>     "gitCommit": [ "[ARGUMENT=0+]" ],
>     "testRoot": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "testFileSuffix": [ "[ARGUMENT=1+]" ],
>     "testRequire": [ "[ARGUMENT=1+]" ],
>     "testTimeout": [ "[ARGUMENT=1]" ],
>     "init": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "initResourcePackage": [ "[ARGUMENT=1]" ],
>     "initReset": [ "[ARGUMENT=0+]" ],
>     "initVerify": [ "[ARGUMENT=0+]" ],
>     "initVerifyRule": [ "[ARGUMENT=1+]" ],
>     "parseScript": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "parseScriptList": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "runScript": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "runScriptList": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "npmCombo": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "npxLazy": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>   }
> ```

#### Resource package
📄 [resource/](resource/)

| Package name                            |  Version |
| :----                                   |    ----: |
| @babel/cli                              |   ^7.8.4 |
| @babel/core                             |   ^7.9.0 |
| @babel/plugin-proposal-class-properties |   ^7.8.3 |
| @babel/preset-env                       |   ^7.9.5 |
| @babel/preset-react                     |   ^7.9.4 |
| @babel/register                         |   ^7.9.0 |
| babel-eslint                            |  ^10.1.0 |
| babel-loader                            |   ^8.1.0 |
| babel-plugin-minify-replace             |   ^0.5.0 |
| babel-plugin-module-resolver            |   ^4.0.0 |
| babel-plugin-styled-components          |  ^1.10.7 |
| cross-env                               |   ^7.0.2 |
| eslint                                  |   ^6.8.0 |
| eslint-plugin-import                    |  ^2.20.2 |
| eslint-plugin-node                      |  ^11.1.0 |
| eslint-plugin-promise                   |   ^4.2.1 |
| eslint-plugin-react                     |  ^7.19.0 |
| prop-types                              |  ^15.7.2 |
| puppeteer                               |   ^2.1.1 |
| react                                   | ^16.13.1 |
| styled-components                       |   ^5.1.0 |
| terser                                  |  ^4.6.11 |
| webpack                                 |  ^4.42.1 |
