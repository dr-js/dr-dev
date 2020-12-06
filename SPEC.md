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
  - `getTerserOption`, `minifyFileListWithTerser`, `minifyFileWithTerser`
+ 📄 [source/output.js](source/output.js)
  - `clearOutput`, `getPublishFlag`, `initOutput`, `packOutput`, `publishOutput`, `verifyGitStatusClean`, `verifyNoGitignore`, `verifyOutputBin`, `verifyPublishVersion`
+ 📄 [source/puppeteer.js](source/puppeteer.js)
  - `clearPuppeteerBrowser`, `clearPuppeteerPage`, `initPuppeteerBrowser`, `initPuppeteerPage`, `runWithPuppeteer`, `testWithPuppeteer`, `wrapTestScriptStringToHTML`
+ 📄 [source/webpack.js](source/webpack.js)
  - `commonFlag`, `compileWithWebpack`
+ 📄 [source/common/dev.js](source/common/dev.js)
  - `createTransformCacheWithInfo`, `hijackSetTimeoutInterval`
+ 📄 [source/common/test.js](source/common/test.js)
  - `createTest`
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
  - `runAndHandover`, `withRunBackground`
+ 📄 [source/node/cache/checksum.js](source/node/cache/checksum.js)
  - `checksumDetectChange`, `checksumUpdate`, `describeChecksumInfoList`, `describeChecksumOfPathList`, `getChecksumInfoListOfPath`, `getChecksumInfoListOfPathList`, `getChecksumInfoOfFile`, `loadStatFile`, `saveStatFile`
+ 📄 [source/node/cache/function.js](source/node/cache/function.js)
  - `loadStat`, `packTime`, `parseTime`, `saveStat`
+ 📄 [source/node/cache/staleCheck.js](source/node/cache/staleCheck.js)
  - `describeStaleReport`, `loadStatFile`, `saveStatFile`, `staleCheckCalcReport`, `staleCheckMark`, `staleCheckSetup`
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
  - `npxLazy`, `runNpx`
+ 📄 [source/node/npm/parseScript.js](source/node/npm/parseScript.js)
  - `parseCommand`, `parsePackageScript`, `warpBashSubShell`, `wrapJoinBashArgs`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from JS/JSON: set to "path/to/config.js|json"
>       from ENV: set to "env" to enable, default not check env
>       from ENV JSON: set to "json-env:$env-name" to read the ENV string as JSON
>       from CLI JSON: set to "json-cli:$json-string" to read the appended string as JSON
>   --help --h -h [OPTIONAL] [ARGUMENT=0-1]
>       show full help
>   --version --v -v [OPTIONAL] [ARGUMENT=0-1]
>       show version
>   --debug --D -D [OPTIONAL] [ARGUMENT=0-1]
>       more debug log
>   --path-input --i -i [ARGUMENT=1]
>       path to "package.json", or directory with "package.json" inside
>   --pack [OPTIONAL] [ARGUMENT=0-1]
>       set to ANY value to enable, except "false/no/n/0"
>     --path-output [ARGUMENT=1]
>         output path
>     --output-name [ARGUMENT=1]
>         output package name
>     --output-version [ARGUMENT=1]
>         output package version
>     --output-description [ARGUMENT=1]
>         output package description
>     --publish [ARGUMENT=0-1]
>         run npm publish
>     --publish-dev [ARGUMENT=0-1]
>         run npm publish-dev
>     --dry-run [ARGUMENT=0-1]
>         for testing publish procedure
>   --check-outdated --C -C [OPTIONAL] [ARGUMENT=0-1]
>       set to ANY value to enable, except "false/no/n/0"
>     --path-temp [ARGUMENT=1]
>   --step-package-version --S -S [OPTIONAL] [ARGUMENT=0-1]
>       step up package version (expect "0.0.0-dev.0-local.0" format)
>     --sort-key --K -K [ARGUMENT=0-1]
>         sort keys in package.json
>     --git-commit --G -G [ARGUMENT=0-1]
>         step up patch version, and prepare a git commit
>   --test-root --T -T [OPTIONAL] [ARGUMENT=1+]
>       root path to look test file from, default to "."
>     --test-file-suffix --TFS [ARGUMENT=1+]
>         pattern for test file, default to ".js"
>     --test-require --TR [ARGUMENT=1+]
>         module or file to require before test files, mostly for "@babel/register"
>     --test-timeout --TT [ARGUMENT=1]
>         timeout for each test, in msec, default to 42*1000 (42sec)
>   --init --I -I [OPTIONAL] [ARGUMENT=0-1]
>       path for init a package, will not reset existing file, default to "."
>     --init-resource-package --P -P [ARGUMENT=1]
>         path to resource package, default search for "./node_modules/@dr-js/dev-*/"
>     --init-reset --R -R [ARGUMENT=0-1]
>         allow init to reset existing file
>     --init-verify --V -V [ARGUMENT=0-1]
>         do common init file content check, will skip file modify
>     --init-verify-rule --IVR [ARGUMENT=1+]
>         path to verify rule, default search in "init-resource-package"
>   --exec --E -E [OPTIONAL] [ARGUMENT=1+]
>       exec command, allow set env and cwd: $@=command, ...argList
>     --exec-env --EE [ARGUMENT=0-1]
>         use URLSearchParams format String, or key-value Object
>     --exec-cwd --EC [ARGUMENT=0-1]
>         reset cwd to path
>   --cache-step --cs [OPTIONAL] [ARGUMENT=1]
>       one of:
>         setup mark prune is-hash-changed
>         IHC checksum-file-only CFO
>     --prune-policy [ARGUMENT=1]
>         one of:
>           unused stale-only debug
>     --path-stat-file [ARGUMENT=1]
>         path of stat file, used to help detect checksum change and compare stale-check time, only optional for "checksum-file-only" mode
>     --path-checksum-list --pcl [ARGUMENT=1+]
>         list of file or directory to calc checksum
>     --path-checksum-file --pcf [ARGUMENT=1]
>         path for generated checksum file
>     --path-stale-check-list [ARGUMENT=0+]
>         list of cache file or directory to check time
>     --path-stale-check-file [ARGUMENT=1]
>         path for generated stale-check report file, also useful for debugging
>     --max-stale-day [ARGUMENT=1]
>         how old unused file is stale, default: 8day
>   --exec-load --EL [OPTIONAL] [ARGUMENT=1+]
>       load and exec command from package.json[ "devExecCommands" ]: $@=commandName, ...extraArgList
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
>     export DR_DEV_HELP="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_VERSION="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_DEBUG="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_PATH_INPUT="[ARGUMENT=1]"
>     export DR_DEV_PACK="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_PATH_OUTPUT="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_NAME="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_VERSION="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_DESCRIPTION="[ARGUMENT=1]"
>     export DR_DEV_PUBLISH="[ARGUMENT=0-1]"
>     export DR_DEV_PUBLISH_DEV="[ARGUMENT=0-1]"
>     export DR_DEV_DRY_RUN="[ARGUMENT=0-1]"
>     export DR_DEV_CHECK_OUTDATED="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_PATH_TEMP="[ARGUMENT=1]"
>     export DR_DEV_STEP_PACKAGE_VERSION="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_SORT_KEY="[ARGUMENT=0-1]"
>     export DR_DEV_GIT_COMMIT="[ARGUMENT=0-1]"
>     export DR_DEV_TEST_ROOT="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_TEST_FILE_SUFFIX="[ARGUMENT=1+] [ALIAS=DR_DEV_TFS]"
>     export DR_DEV_TEST_REQUIRE="[ARGUMENT=1+] [ALIAS=DR_DEV_TR]"
>     export DR_DEV_TEST_TIMEOUT="[ARGUMENT=1] [ALIAS=DR_DEV_TT]"
>     export DR_DEV_INIT="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_INIT_RESOURCE_PACKAGE="[ARGUMENT=1]"
>     export DR_DEV_INIT_RESET="[ARGUMENT=0-1]"
>     export DR_DEV_INIT_VERIFY="[ARGUMENT=0-1]"
>     export DR_DEV_INIT_VERIFY_RULE="[ARGUMENT=1+] [ALIAS=DR_DEV_IVR]"
>     export DR_DEV_EXEC="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_EXEC_ENV="[ARGUMENT=0-1] [ALIAS=DR_DEV_EE]"
>     export DR_DEV_EXEC_CWD="[ARGUMENT=0-1] [ALIAS=DR_DEV_EC]"
>     export DR_DEV_CACHE_STEP="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_DEV_CS]"
>     export DR_DEV_PRUNE_POLICY="[ARGUMENT=1]"
>     export DR_DEV_PATH_STAT_FILE="[ARGUMENT=1]"
>     export DR_DEV_PATH_CHECKSUM_LIST="[ARGUMENT=1+] [ALIAS=DR_DEV_PCL]"
>     export DR_DEV_PATH_CHECKSUM_FILE="[ARGUMENT=1] [ALIAS=DR_DEV_PCF]"
>     export DR_DEV_PATH_STALE_CHECK_LIST="[ARGUMENT=0+]"
>     export DR_DEV_PATH_STALE_CHECK_FILE="[ARGUMENT=1]"
>     export DR_DEV_MAX_STALE_DAY="[ARGUMENT=1]"
>     export DR_DEV_EXEC_LOAD="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_EL]"
>     export DR_DEV_PARSE_SCRIPT="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_PS]"
>     export DR_DEV_PARSE_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_PSL]"
>     export DR_DEV_RUN_SCRIPT="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_RS]"
>     export DR_DEV_RUN_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_RSL]"
>     export DR_DEV_NPM_COMBO="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_NC]"
>     export DR_DEV_NPX_LAZY="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_NPX,DR_DEV_NL]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "debug": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "pathInput": [ "[ARGUMENT=1]" ],
>     "pack": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "pathOutput": [ "[ARGUMENT=1]" ],
>     "outputName": [ "[ARGUMENT=1]" ],
>     "outputVersion": [ "[ARGUMENT=1]" ],
>     "outputDescription": [ "[ARGUMENT=1]" ],
>     "publish": [ "[ARGUMENT=0-1]" ],
>     "publishDev": [ "[ARGUMENT=0-1]" ],
>     "dryRun": [ "[ARGUMENT=0-1]" ],
>     "checkOutdated": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "pathTemp": [ "[ARGUMENT=1]" ],
>     "stepPackageVersion": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "sortKey": [ "[ARGUMENT=0-1]" ],
>     "gitCommit": [ "[ARGUMENT=0-1]" ],
>     "testRoot": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "testFileSuffix": [ "[ARGUMENT=1+] [ALIAS=TFS]" ],
>     "testRequire": [ "[ARGUMENT=1+] [ALIAS=TR]" ],
>     "testTimeout": [ "[ARGUMENT=1] [ALIAS=TT]" ],
>     "init": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "initResourcePackage": [ "[ARGUMENT=1]" ],
>     "initReset": [ "[ARGUMENT=0-1]" ],
>     "initVerify": [ "[ARGUMENT=0-1]" ],
>     "initVerifyRule": [ "[ARGUMENT=1+] [ALIAS=IVR]" ],
>     "exec": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "execEnv": [ "[ARGUMENT=0-1] [ALIAS=EE]" ],
>     "execCwd": [ "[ARGUMENT=0-1] [ALIAS=EC]" ],
>     "cacheStep": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=cs]" ],
>     "prunePolicy": [ "[ARGUMENT=1]" ],
>     "pathStatFile": [ "[ARGUMENT=1]" ],
>     "pathChecksumList": [ "[ARGUMENT=1+] [ALIAS=pcl]" ],
>     "pathChecksumFile": [ "[ARGUMENT=1] [ALIAS=pcf]" ],
>     "pathStaleCheckList": [ "[ARGUMENT=0+]" ],
>     "pathStaleCheckFile": [ "[ARGUMENT=1]" ],
>     "maxStaleDay": [ "[ARGUMENT=1]" ],
>     "execLoad": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=EL]" ],
>     "parseScript": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=ps]" ],
>     "parseScriptList": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=psl]" ],
>     "runScript": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=rs]" ],
>     "runScriptList": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=rsl]" ],
>     "npmCombo": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=nc]" ],
>     "npxLazy": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=npx,nl]" ],
>   }
> ```

#### Resource package
📄 [resource/](resource/)

| Package name                   | Version |
| :----                          |   ----: |
| @babel/cli                     | ^7.12.8 |
| @babel/core                    | ^7.12.9 |
| @babel/preset-env              | ^7.12.7 |
| @babel/preset-react            | ^7.12.7 |
| @babel/register                | ^7.12.1 |
| babel-eslint                   | ^10.1.0 |
| babel-loader                   |  ^8.2.2 |
| babel-plugin-minify-replace    |  ^0.5.0 |
| babel-plugin-module-resolver   |  ^4.0.0 |
| babel-plugin-styled-components | ^1.12.0 |
| eslint                         | ^7.15.0 |
| eslint-plugin-import           | ^2.22.1 |
| eslint-plugin-node             | ^11.1.0 |
| eslint-plugin-promise          |  ^4.2.1 |
| eslint-plugin-react            | ^7.21.5 |
| prop-types                     | ^15.7.2 |
| puppeteer                      |  ^5.5.0 |
| react                          | ^17.0.1 |
| styled-components              |  ^5.2.1 |
| terser                         |  ^5.5.1 |
| webpack                        | ^5.10.0 |
