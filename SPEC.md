# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)
* [Resource package](#resource-package)

#### Export Path
+ 📄 [source/babel.js](source/babel.js)
  - `getBabelConfig`, `getWebpackBabelConfig`
+ 📄 [source/ci.js](source/ci.js)
  - `commonInfoPatchCombo`, `runInfoPatchCombo`
+ 📄 [source/docker.js](source/docker.js)
  - `checkImageExist`, `checkLocalImage`, `checkPullImage`, `compose`, `composeSync`, `docker`, `dockerSync`, `dockerWithTee`, `getContainerLsList`, `getContainerPsList`, `matchContainerLsList`, `matchContainerPsList`, `patchContainerLsListStartedAt`, `pullImage`, `runDocker`, `runDockerWithTee`
+ 📄 [source/fileProcessor.js](source/fileProcessor.js)
  - `fileProcessorBabel`, `fileProcessorWebpack`, `processFileList`
+ 📄 [source/license.js](source/license.js)
  - `writeLicenseFile`
+ 📄 [source/main.js](source/main.js)
  - `argvFlag`, `commonCombo`, `commonInfoPatchCombo`, `existsSync`, `readFileSync`, `resolve`, `runInfoPatchCombo`, `runMain`, `sep`, `writeFileSync`
+ 📄 [source/minify.js](source/minify.js)
  - `GET_TERSER`, `getTerserOption`, `minifyFileListWithTerser`, `minifyFileWithTerser`
+ 📄 [source/output.js](source/output.js)
  - `REGEXP_PUBLISH_VERSION`, `REGEXP_PUBLISH_VERSION_DEV`, `clearOutput`, `commonCombo`, `fromPathCombo`, `getPublishFlag`, `initOutput`, `packOutput`, `publishOutput`, `publishPackage`, `verifyGitStatusClean`, `verifyNoGitignore`, `verifyOutputBin`, `verifyPackageVersionStrict`, `verifyPublishVersion`
+ 📄 [source/puppeteer.js](source/puppeteer.js)
  - `GET_PUPPETEER`, `clearPuppeteerBrowser`, `clearPuppeteerPage`, `initPuppeteerBrowser`, `initPuppeteerPage`, `reloadPuppeteerPage`, `runWithPuppeteer`, `setupPuppeteerPage`, `testBootPuppeteer`, `testWithPuppeteer`, `wrapTestScriptStringToHTML`
+ 📄 [source/webpack.js](source/webpack.js)
  - `GET_WEBPACK`, `commonFlag`, `compileWithWebpack`
+ 📄 [source/webpack-progress-plugin.js](source/webpack-progress-plugin.js)
  - `createProgressPlugin`
+ 📄 [source/browser/resource.js](source/browser/resource.js)
  - `loadImage`, `loadScript`, `loadText`
+ 📄 [source/common/dev.js](source/common/dev.js)
  - `createTransformCacheWithInfo`, `hijackSetTimeoutInterval`
+ 📄 [source/common/test.js](source/common/test.js)
  - `createTest`
+ 📄 [source/common/packageJSON/Version.js](source/common/packageJSON/Version.js)
  - `isVersionSpecComplex`, `versionBumpByGitBranch`, `versionBumpLastNumber`, `versionBumpToIdentifier`, `versionBumpToLocal`
+ 📄 [source/common/packageJSON/function.js](source/common/packageJSON/function.js)
  - `PACKAGE_KEY_DEV_EXEC_COMMAND_MAP`, `collectDependency`, `getFirstBinPath`, `packPackageJSON`, `sortPackageJSON`, `toPackageInfo`
+ 📄 [source/node/color.js](source/node/color.js)
  - `color`
+ 📄 [source/node/env.js](source/node/env.js)
  - `__VERBOSE__`, `argvFlag`, `checkFlag`, `loadEnvKey`, `saveEnvKey`, `syncEnvKey`
+ 📄 [source/node/file.js](source/node/file.js)
  - `copyAfterEdit`, `editFile`, `editJson`, `editText`, `filterPrecompressFileList`, `findPathFragList`, `generatePrecompressForPath`, `getFileListFromPathList`, `loadFile`, `loadJson`, `loadText`, `resetDirectory`, `saveFile`, `saveJson`, `saveText`, `trimPrecompressForPath`, `withTempDirectory`
+ 📄 [source/node/filePreset.js](source/node/filePreset.js)
  - `getSourceJsFileListFromPathList`
+ 📄 [source/node/logger.js](source/node/logger.js)
  - `getLogger`
+ 📄 [source/node/preset.js](source/node/preset.js)
  - `FILTER_JS_FILE`, `FILTER_SOURCE_JS_FILE`, `FILTER_SOURCE_PATH`, `FILTER_TEST_JS_FILE`, `FILTER_TEST_PATH`
+ 📄 [source/node/resource.js](source/node/resource.js)
  - `loadJSON`, `loadLocalJSON`, `loadLocalScript`, `loadRemoteJSON`, `loadRemoteScript`, `loadScript`
+ 📄 [source/node/run.js](source/node/run.js)
  - `runAndHandover`, `runPassThrough`, `runWithAsyncFunc`, `runWithTee`, `withCwd`, `withRunBackground`
+ 📄 [source/node/ssh.js](source/node/ssh.js)
  - `GET_SSH2`, `LOG_CONFIG`, `LOG_ERROR`, `LOG_EXEC`, `createColorLog`, `getConnectOption`, `quickSSH`, `startDryRunSSHClient`, `startSSHClient`
+ 📄 [source/node/verify.js](source/node/verify.js)
  - `runTaskList`, `toTask`, `useKitLogger`, `verifyCommand`, `verifyCommandSemVer`, `verifyFile`, `verifyFileString`, `verifySemVer`, `verifyString`, `verifyTaskList`
+ 📄 [source/node/cache/checksum.js](source/node/cache/checksum.js)
  - `checksumDetectChange`, `checksumUpdate`, `describeChecksumInfoList`, `describeChecksumOfPathList`, `getChecksumInfoListOfPath`, `getChecksumInfoListOfPathList`, `getChecksumInfoOfFile`, `loadStatFile`, `saveStatFile`
+ 📄 [source/node/cache/function.js](source/node/cache/function.js)
  - `loadStat`, `packTime`, `parseTime`, `saveStat`
+ 📄 [source/node/cache/staleCheck.js](source/node/cache/staleCheck.js)
  - `describeStaleReport`, `loadStatFile`, `saveStatFile`, `staleCheckCalcReport`, `staleCheckMark`, `staleCheckSetup`
+ 📄 [source/node/config/Nginx.js](source/node/config/Nginx.js)
  - `COMBO_BROTLI`, `COMBO_BROTLI_STATIC`, `COMBO_COMPRESS`, `COMBO_COMPRESS_STATIC`, `COMBO_GZIP`, `COMBO_GZIP_STATIC`, `COMBO_MIME`, `COMMON_COMPRESS_MIME_LIST`, `COMMON_MIME_MAP`, `DEFAULT_MIME`, `stringifyNginxConf`
+ 📄 [source/node/config/Object.js](source/node/config/Object.js)
  - `SECRET_PREFIX`, `mergeFlavor`, `pickFlavor`, `useFlavor`, `useSecret`
+ 📄 [source/node/config/Output.js](source/node/config/Output.js)
  - `outputConfig`, `outputConfigMap`
+ 📄 [source/node/config/YAML.js](source/node/config/YAML.js)
  - `GET_YAML`, `USE_YAML`, `parseYAML`, `readYAML`, `stringifyYAML`, `writeYAML`
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
  - `npxLazy`, `runNpx`, `runNpxLazy`
+ 📄 [source/node/npm/parseScript.js](source/node/npm/parseScript.js)
  - `parseCommand`, `parsePackageScript`, `warpBashSubShell`, `wrapJoinBashArgs`
+ 📄 [source/node/package/Npm.js](source/node/package/Npm.js)
  - `outdatedJSON`, `outdatedWithTempJSON`
+ 📄 [source/node/package/Trim.js](source/node/package/Trim.js)
  - `trimFile`, `trimFileNodeModules`, `trimFileRubyGem`
+ 📄 [source/node/package/function.js](source/node/package/function.js)
  - `editPackageJSON`, `loadPackageCombo`, `loadPackageInfo`, `loadPackageInfoList`, `savePackageInfo`, `savePackageJSON`, `toPackageJSONPath`, `toPackageRootPath`, `writePackageJSON`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from JS/JSON: set to "path/to/config.js|json"
>       from ENV: set to "env" to enable, default not check env
>       from ENV JSON: set to "json-env:ENV_NAME" to read the ENV string as JSON, or "jz64/jb64-env"
>       from CLI JSON: set to "json-cli:JSON_STRING" to read the appended string as JSON, or "jz64/jb64-cli"
>   --help --h -h [OPTIONAL] [ARGUMENT=0-1]
>       show full help
>   --version --v -v [OPTIONAL] [ARGUMENT=0-1]
>       show version
>   --note --N -N [OPTIONAL] [ARGUMENT=1+]
>       noop, tag for ps/htop
>   --quiet --q -q [OPTIONAL] [ARGUMENT=0-1]
>       less log
>   --debug --D -D [OPTIONAL] [ARGUMENT=0-1]
>       more debug log, mute by "quiet"
>   --input-file --I -I [OPTIONAL] [ARGUMENT=1]
>       common option
>   --output-file --O -O [OPTIONAL] [ARGUMENT=1]
>       common option
>   --pid-file --pid [OPTIONAL] [ARGUMENT=1]
>       common option
>   --root --path-input --R -R [OPTIONAL] [ARGUMENT=1]
>       common option, may be path to repo folder, or "package.json" file: $0=path/cwd
>   --git-commit --G -G [OPTIONAL] [ARGUMENT=0-1]
>       common option, mostly for version marking
>   --shell-alias --SA --A -A [OPTIONAL] [ARGUMENT=1+]
>       run shell alias: $@=aliasName,...aliasArgList
>   --version-bump-git-branch --VBGB [OPTIONAL] [ARGUMENT=0-1]
>       bump package version by git branch: -G=isGitCommit, -D=isLongCommitText, $0=gitBranch/current
>   --version-bump-last-number --VBLN [OPTIONAL] [ARGUMENT=0-1]
>       bump the last number found in package version: -G, -D
>   --version-bump-to-identifier --VBTI [OPTIONAL] [ARGUMENT=0-1]
>       bump package version to identifier: -G, -D, $0=labelIdentifier/dev
>   --version-bump-to-local --VBTL [OPTIONAL] [ARGUMENT=0-1]
>       bump package version to append identifier "local", for local testing: -G, -D
>   --package-trim-node-modules --PTNM [OPTIONAL] [ARGUMENT=1+]
>       trim common doc/test/config in "node_modules/": $@=...pathList
>   --package-trim-ruby-gem --PTRG [OPTIONAL] [ARGUMENT=1+]
>       trim common doc/test/config in "lib/ruby/gems/*/gems/": $@=...pathList
>   --test --test-root --T -T [OPTIONAL] [ARGUMENT=1+]
>       list of path to look test file from, default to "."
>     --test-file-suffix --TFS [ARGUMENT=1+]
>         pattern for test file, default to ".js"
>     --test-require --TR [ARGUMENT=1+]
>         module or file to require before test files, mostly for "@babel/register"
>     --test-timeout --TT [ARGUMENT=1]
>         timeout for each test, in msec, default to 42*1000 (42sec)
>   --parse-script --ps [OPTIONAL] [ARGUMENT=1+]
>       parse and echo: $@=scriptName,...extraArgs
>   --parse-script-list --psl [OPTIONAL] [ARGUMENT=1+]
>       combine multi-script, but no extraArgs: $@=...scriptNameList
>   --run-script --rs [OPTIONAL] [ARGUMENT=1+]
>       parse and run: $@=scriptName,...extraArgs
>   --run-script-list --rsl [OPTIONAL] [ARGUMENT=1+]
>       combine multi-script, but no extraArgs: $@=...scriptNameList
>   --eval --e -e [OPTIONAL] [ARGUMENT=0+]
>       eval file or string: -O=outputFile, -I/$0=scriptFile/scriptString, $@=...evalArgv
>   --repl --i -i [OPTIONAL] [ARGUMENT=0-1]
>       start node REPL
>   --check-outdated --C -C [OPTIONAL] [ARGUMENT=0-1]
>       check dependency version from "package.json", or all under the folder: $0/-R=checkPath/"./package.json"
>     --write-back --wb [ARGUMENT=0-1]
>         set to ANY value to enable, except "false/no/n/0"
>     --path-temp [ARGUMENT=1]
>         use "AUTO" for os temp,set will disable in-place check for single "package.json"
>   --step-package-version --S -S [OPTIONAL] [ARGUMENT=0-1]
>       step up package version (expect "0.0.0-dev.0-local.0" format): -G=isGitCommit
>     --sort-key --K -K [ARGUMENT=0-1]
>         sort keys in package.json
>   --init [OPTIONAL] [ARGUMENT=0-1]
>       path for init a package, will not reset existing file, default to "."
>     --init-resource-package [ARGUMENT=1]
>         path to resource package, default search for "./node_modules/@dr-js/dev-*/"
>     --init-reset [ARGUMENT=0-1]
>         allow init to reset existing file
>     --init-verify [ARGUMENT=0-1]
>         do common init file content check, will skip file modify
>     --init-verify-rule [ARGUMENT=1+]
>         path to verify rule, default search in "init-resource-package"
>   --exec --E -E [OPTIONAL] [ARGUMENT=1+]
>       exec command, allow set env and cwd: $@=command, ...argList
>     --exec-env --EE [ARGUMENT=0-1]
>         use URLSearchParams format String, or key-value Object
>     --exec-cwd --EC [ARGUMENT=0-1]
>         reset cwd to path
>   --exec-load --EL [OPTIONAL] [ARGUMENT=1+]
>       load and exec command from package.json[ "devExecCommands" ]: $@=commandName, ...extraArgList
>   --cache-step --cs [OPTIONAL] [ARGUMENT=1]
>       one of:
>         setup mark prune is-hash-changed
>         IHC checksum-file-only CFO
>     --prune-policy [ARGUMENT=1]
>         "prune" only, one of:
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
>   --npm-combo --nc --M -M [OPTIONAL] [ARGUMENT=1+]
>       useful npm combo, one of: config|c|install-offline|io|install-clear|ic|package-dedupe|ddp|pd|package-reset|pr
>   --npx-lazy --npx --nl --X -X [OPTIONAL] [ARGUMENT=1+]
>       skip npx re-install if package version fit: $@=package@version,...extraArgs
>   --fetch --f -f [OPTIONAL] [ARGUMENT=1-4]
>       fetch url with http_proxy env support: -I=requestBody/null, -O=outputFile/stdout, $@=initialUrl,method/GET,jumpMax/4,timeout/0
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_DEV_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_DEV_HELP="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_VERSION="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_NOTE="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_QUIET="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_DEBUG="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_INPUT_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export DR_DEV_OUTPUT_FILE="[OPTIONAL] [ARGUMENT=1]"
>     export DR_DEV_PID_FILE="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_DEV_PID]"
>     export DR_DEV_ROOT="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_DEV_PATH_INPUT]"
>     export DR_DEV_GIT_COMMIT="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_SHELL_ALIAS="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_SA]"
>     export DR_DEV_VERSION_BUMP_GIT_BRANCH="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_DEV_VBGB]"
>     export DR_DEV_VERSION_BUMP_LAST_NUMBER="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_DEV_VBLN]"
>     export DR_DEV_VERSION_BUMP_TO_IDENTIFIER="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_DEV_VBTI]"
>     export DR_DEV_VERSION_BUMP_TO_LOCAL="[OPTIONAL] [ARGUMENT=0-1] [ALIAS=DR_DEV_VBTL]"
>     export DR_DEV_PACKAGE_TRIM_NODE_MODULES="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_PTNM]"
>     export DR_DEV_PACKAGE_TRIM_RUBY_GEM="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_PTRG]"
>     export DR_DEV_TEST="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_TEST_ROOT]"
>     export DR_DEV_TEST_FILE_SUFFIX="[ARGUMENT=1+] [ALIAS=DR_DEV_TFS]"
>     export DR_DEV_TEST_REQUIRE="[ARGUMENT=1+] [ALIAS=DR_DEV_TR]"
>     export DR_DEV_TEST_TIMEOUT="[ARGUMENT=1] [ALIAS=DR_DEV_TT]"
>     export DR_DEV_PARSE_SCRIPT="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_PS]"
>     export DR_DEV_PARSE_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_PSL]"
>     export DR_DEV_RUN_SCRIPT="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_RS]"
>     export DR_DEV_RUN_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_RSL]"
>     export DR_DEV_EVAL="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_REPL="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_CHECK_OUTDATED="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_WRITE_BACK="[ARGUMENT=0-1] [ALIAS=DR_DEV_WB]"
>     export DR_DEV_PATH_TEMP="[ARGUMENT=1]"
>     export DR_DEV_STEP_PACKAGE_VERSION="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_SORT_KEY="[ARGUMENT=0-1]"
>     export DR_DEV_INIT="[OPTIONAL] [ARGUMENT=0-1]"
>     export DR_DEV_INIT_RESOURCE_PACKAGE="[ARGUMENT=1]"
>     export DR_DEV_INIT_RESET="[ARGUMENT=0-1]"
>     export DR_DEV_INIT_VERIFY="[ARGUMENT=0-1]"
>     export DR_DEV_INIT_VERIFY_RULE="[ARGUMENT=1+]"
>     export DR_DEV_EXEC="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_EXEC_ENV="[ARGUMENT=0-1] [ALIAS=DR_DEV_EE]"
>     export DR_DEV_EXEC_CWD="[ARGUMENT=0-1] [ALIAS=DR_DEV_EC]"
>     export DR_DEV_EXEC_LOAD="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_EL]"
>     export DR_DEV_CACHE_STEP="[OPTIONAL] [ARGUMENT=1] [ALIAS=DR_DEV_CS]"
>     export DR_DEV_PRUNE_POLICY="[ARGUMENT=1]"
>     export DR_DEV_PATH_STAT_FILE="[ARGUMENT=1]"
>     export DR_DEV_PATH_CHECKSUM_LIST="[ARGUMENT=1+] [ALIAS=DR_DEV_PCL]"
>     export DR_DEV_PATH_CHECKSUM_FILE="[ARGUMENT=1] [ALIAS=DR_DEV_PCF]"
>     export DR_DEV_PATH_STALE_CHECK_LIST="[ARGUMENT=0+]"
>     export DR_DEV_PATH_STALE_CHECK_FILE="[ARGUMENT=1]"
>     export DR_DEV_MAX_STALE_DAY="[ARGUMENT=1]"
>     export DR_DEV_NPM_COMBO="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_NC]"
>     export DR_DEV_NPX_LAZY="[OPTIONAL] [ARGUMENT=1+] [ALIAS=DR_DEV_NPX,DR_DEV_NL]"
>     export DR_DEV_FETCH="[OPTIONAL] [ARGUMENT=1-4]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "note": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "debug": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "inputFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "outputFile": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "pidFile": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=pid]" ],
>     "root": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=pathInput]" ],
>     "gitCommit": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "shellAlias": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=SA]" ],
>     "versionBumpGitBranch": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=VBGB]" ],
>     "versionBumpLastNumber": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=VBLN]" ],
>     "versionBumpToIdentifier": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=VBTI]" ],
>     "versionBumpToLocal": [ "[OPTIONAL] [ARGUMENT=0-1] [ALIAS=VBTL]" ],
>     "packageTrimNodeModules": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=PTNM]" ],
>     "packageTrimRubyGem": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=PTRG]" ],
>     "test": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=testRoot]" ],
>     "testFileSuffix": [ "[ARGUMENT=1+] [ALIAS=TFS]" ],
>     "testRequire": [ "[ARGUMENT=1+] [ALIAS=TR]" ],
>     "testTimeout": [ "[ARGUMENT=1] [ALIAS=TT]" ],
>     "parseScript": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=ps]" ],
>     "parseScriptList": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=psl]" ],
>     "runScript": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=rs]" ],
>     "runScriptList": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=rsl]" ],
>     "eval": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "repl": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "checkOutdated": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "writeBack": [ "[ARGUMENT=0-1] [ALIAS=wb]" ],
>     "pathTemp": [ "[ARGUMENT=1]" ],
>     "stepPackageVersion": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "sortKey": [ "[ARGUMENT=0-1]" ],
>     "init": [ "[OPTIONAL] [ARGUMENT=0-1]" ],
>     "initResourcePackage": [ "[ARGUMENT=1]" ],
>     "initReset": [ "[ARGUMENT=0-1]" ],
>     "initVerify": [ "[ARGUMENT=0-1]" ],
>     "initVerifyRule": [ "[ARGUMENT=1+]" ],
>     "exec": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "execEnv": [ "[ARGUMENT=0-1] [ALIAS=EE]" ],
>     "execCwd": [ "[ARGUMENT=0-1] [ALIAS=EC]" ],
>     "execLoad": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=EL]" ],
>     "cacheStep": [ "[OPTIONAL] [ARGUMENT=1] [ALIAS=cs]" ],
>     "prunePolicy": [ "[ARGUMENT=1]" ],
>     "pathStatFile": [ "[ARGUMENT=1]" ],
>     "pathChecksumList": [ "[ARGUMENT=1+] [ALIAS=pcl]" ],
>     "pathChecksumFile": [ "[ARGUMENT=1] [ALIAS=pcf]" ],
>     "pathStaleCheckList": [ "[ARGUMENT=0+]" ],
>     "pathStaleCheckFile": [ "[ARGUMENT=1]" ],
>     "maxStaleDay": [ "[ARGUMENT=1]" ],
>     "npmCombo": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=nc]" ],
>     "npxLazy": [ "[OPTIONAL] [ARGUMENT=1+] [ALIAS=npx,nl]" ],
>     "fetch": [ "[OPTIONAL] [ARGUMENT=1-4]" ],
>   }
> ```

#### Resource package
📄 [resource/](resource/)

| Package name                   |     Version |
| :----                          |       ----: |
| @babel/cli                     |     ^7.16.0 |
| @babel/core                    |     ^7.16.0 |
| @babel/eslint-parser           |     ^7.16.0 |
| @babel/preset-env              |     ^7.16.0 |
| @babel/preset-react            |     ^7.16.0 |
| @babel/register                |     ^7.16.0 |
| babel-loader                   |      ^8.2.3 |
| babel-plugin-minify-replace    |      ^0.5.0 |
| babel-plugin-module-resolver   |      ^4.1.0 |
| babel-plugin-styled-components |     ^1.13.3 |
| eslint                         |     ^7.32.0 |
| eslint-plugin-import           |     ^2.25.2 |
| eslint-plugin-node             |     ^11.1.0 |
| eslint-plugin-promise          |      ^5.1.1 |
| eslint-plugin-react            |     ^7.26.1 |
| prop-types                     |     ^15.7.2 |
| puppeteer                      |     ^10.4.0 |
| react                          |     ^17.0.2 |
| styled-components              |      ^5.3.3 |
| terser                         |      ^5.9.0 |
| webpack                        |     ^5.61.0 |
