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
  - `checkPublishVersion`, `getPackageTgzName`, `getPublishFlag`, `initOutput`, `packOutput`, `publishOutput`, `verifyNoGitignore`, `verifyOutputBinVersion`
+ 📄 [source/puppeteer.js](source/puppeteer.js)
  - `clearPuppeteerBrowser`, `clearPuppeteerPage`, `initPuppeteerBrowser`, `initPuppeteerPage`, `runWithPuppeteer`, `testWithPuppeteer`
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
  - `getFileListFromPathList`, `getScriptFileListFromPathList`, `withTempDirectory`
+ 📄 [source/node/logger.js](source/node/logger.js)
  - `getLogger`
+ 📄 [source/node/run.js](source/node/run.js)
  - `getGitBranch`, `getGitCommitHash`, `withRunBackground`
+ 📄 [source/node/export/generate.js](source/node/export/generate.js)
  - `EXPORT_HOIST_LIST_KEY`, `EXPORT_LIST_KEY`, `HOIST_LIST_KEY`, `generateExportInfo`, `generateIndexScript`
+ 📄 [source/node/export/parse.js](source/node/export/parse.js)
  - `collectSourceRouteMap`, `createExportParser`
+ 📄 [source/node/export/renderMarkdown.js](source/node/export/renderMarkdown.js)
  - `escapeMarkdownLink`, `getMarkdownDirectoryLink`, `getMarkdownFileLink`, `getMarkdownHeaderLink`, `renderMarkdownAutoAppendHeaderLink`, `renderMarkdownBlockQuote`, `renderMarkdownExportPath`, `renderMarkdownExportTree`, `renderMarkdownTable`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env"
>       from JS/JSON file: set to "path/to/config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --path-input --i -i [ARGUMENT=1]
>       path to "package.json", or directory with "package.json" inside
>   --check-outdated --C -C [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-temp [ARGUMENT=1]
>   --pack --p -p [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-output --o -o [ARGUMENT=1]
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
>   --step-package-version --S -S [OPTIONAL] [ARGUMENT=0+]
>       step up package version (expect "0.0.0-dev.0-local.0" format)
>     --sort-key --K -K [ARGUMENT=0+]
>         sort keys in package.json
>     --git-commit --G -G [ARGUMENT=0+]
>         step up main version, and prepare a git commit
>   --test-root --T -T [OPTIONAL] [ARGUMENT=1+]
>       root path to look test file from, default to cwd
>     --test-file-suffix --TFS [ARGUMENT=1+]
>         pattern for test file, default to ".js"
>     --test-require --TR [ARGUMENT=1+]
>         module or file to require before test files, mostly for "@babel/register"
>     --test-timeout --TT [ARGUMENT=1]
>         timeout for each test, in msec, default to 10*1000 (10sec)
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_DEV_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_DEV_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_INPUT="[ARGUMENT=1]"
>     export DR_DEV_CHECK_OUTDATED="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_TEMP="[ARGUMENT=1]"
>     export DR_DEV_PACK="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_OUTPUT="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_NAME="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_VERSION="[ARGUMENT=1]"
>     export DR_DEV_OUTPUT_DESCRIPTION="[ARGUMENT=1]"
>     export DR_DEV_PUBLISH="[ARGUMENT=0+]"
>     export DR_DEV_PUBLISH_DEV="[ARGUMENT=0+]"
>     export DR_DEV_STEP_PACKAGE_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_SORT_KEY="[ARGUMENT=0+]"
>     export DR_DEV_GIT_COMMIT="[ARGUMENT=0+]"
>     export DR_DEV_TEST_ROOT="[OPTIONAL] [ARGUMENT=1+]"
>     export DR_DEV_TEST_FILE_SUFFIX="[ARGUMENT=1+]"
>     export DR_DEV_TEST_REQUIRE="[ARGUMENT=1+]"
>     export DR_DEV_TEST_TIMEOUT="[ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathInput": [ "[ARGUMENT=1]" ],
>     "checkOutdated": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathTemp": [ "[ARGUMENT=1]" ],
>     "pack": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathOutput": [ "[ARGUMENT=1]" ],
>     "outputName": [ "[ARGUMENT=1]" ],
>     "outputVersion": [ "[ARGUMENT=1]" ],
>     "outputDescription": [ "[ARGUMENT=1]" ],
>     "publish": [ "[ARGUMENT=0+]" ],
>     "publishDev": [ "[ARGUMENT=0+]" ],
>     "stepPackageVersion": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "sortKey": [ "[ARGUMENT=0+]" ],
>     "gitCommit": [ "[ARGUMENT=0+]" ],
>     "testRoot": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "testFileSuffix": [ "[ARGUMENT=1+]" ],
>     "testRequire": [ "[ARGUMENT=1+]" ],
>     "testTimeout": [ "[ARGUMENT=1]" ],
>   }
> ```

#### Resource package
📄 [resource/](resource/)

| Package name                            |  Version |
| :----                                   |    ----: |
| @babel/cli                              |   ^7.7.0 |
| @babel/core                             |   ^7.7.2 |
| @babel/plugin-proposal-class-properties |   ^7.7.0 |
| @babel/preset-env                       |   ^7.7.1 |
| @babel/preset-react                     |   ^7.7.0 |
| @babel/register                         |   ^7.7.0 |
| babel-eslint                            |  ^10.0.3 |
| babel-loader                            |   ^8.0.6 |
| babel-plugin-minify-replace             |   ^0.5.0 |
| babel-plugin-module-resolver            |   ^3.2.0 |
| babel-plugin-styled-components          |  ^1.10.6 |
| cross-env                               |   ^6.0.3 |
| eslint                                  |   ^6.6.0 |
| eslint-plugin-import                    |  ^2.18.2 |
| eslint-plugin-node                      |  ^10.0.0 |
| eslint-plugin-promise                   |   ^4.2.1 |
| eslint-plugin-react                     |  ^7.16.0 |
| prop-types                              |  ^15.7.2 |
| puppeteer                               |   ^2.0.0 |
| react                                   | ^16.11.0 |
| styled-components                       |   ^4.4.1 |
| terser                                  |   ^4.3.9 |
| webpack                                 |  ^4.41.2 |
