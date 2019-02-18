# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)
* [Resource package](#resource-package)

#### Export Path
+ 📄 [source/commonOutput.js](source/commonOutput.js)
  - `checkPublishVersion`, `getPublishFlag`, `initOutput`, `packOutput`, `publishOutput`, `verifyNoGitignore`, `verifyOutputBinVersion`
+ 📄 [source/exec.js](source/exec.js)
  - `getGitBranch`, `getGitCommitHash`, `tryExec`, `withRunBackground`
+ 📄 [source/fileList.js](source/fileList.js)
  - `getFileListFromPathList`, `getScriptFileListFromPathList`
+ 📄 [source/fileProcessor.js](source/fileProcessor.js)
  - `fileProcessorBabel`, `fileProcessorWebpack`, `processFileList`
+ 📄 [source/license.js](source/license.js)
  - `writeLicenseFile`
+ 📄 [source/logger.js](source/logger.js)
  - `getLogger`
+ 📄 [source/main.js](source/main.js)
  - `__VERBOSE__`, `argvFlag`, `checkFlag`, `loadEnvKey`, `runMain`, `saveEnvKey`, `syncEnvKey`
+ 📄 [source/minify.js](source/minify.js)
  - `getTerserOption`, `minifyFileListWithTerser`, `minifyWithTerser`
+ 📄 [source/puppeteer.js](source/puppeteer.js)
  - `clearPuppeteerBrowser`, `clearPuppeteerPage`, `initPuppeteerBrowser`, `initPuppeteerPage`, `runWithPuppeteer`, `testWithPuppeteer`
+ 📄 [source/terminalColor.js](source/terminalColor.js)
  - `TerminalColor`, `shouldSupportColor`
+ 📄 [source/test.js](source/test.js)
  - `TEST_RUN`, `TEST_SETUP`, `after`, `before`, `describe`, `it`
+ 📄 [source/webpack.js](source/webpack.js)
  - `commonFlag`, `compileWithWebpack`
+ 📄 [source/ExportIndex/generateInfo.js](source/ExportIndex/generateInfo.js)
  - `EXPORT_HOIST_LIST_KEY`, `EXPORT_LIST_KEY`, `HOIST_LIST_KEY`, `generateExportInfo`, `generateIndexScript`
+ 📄 [source/ExportIndex/parseExport.js](source/ExportIndex/parseExport.js)
  - `collectSourceRouteMap`, `createExportParser`
+ 📄 [source/ExportIndex/renderMarkdown.js](source/ExportIndex/renderMarkdown.js)
  - `autoAppendMarkdownHeaderLink`, `escapeMarkdownLink`, `getMarkdownHeaderLink`, `renderMarkdownDirectoryLink`, `renderMarkdownExportPath`, `renderMarkdownExportTree`, `renderMarkdownFileLink`

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
>   --path-input --i -i [OPTIONAL-CHECK] [ARGUMENT=1]
>       path to "package.json", or directory with "package.json" inside
>   --check-outdated --C -C [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-temp [OPTIONAL-CHECK] [ARGUMENT=1]
>   --pack --p -p [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-output --o -o [OPTIONAL-CHECK] [ARGUMENT=1]
>         output path
>     --output-name [OPTIONAL-CHECK] [ARGUMENT=1]
>         output package name
>     --output-version [OPTIONAL-CHECK] [ARGUMENT=1]
>         output package version
>     --output-description [OPTIONAL-CHECK] [ARGUMENT=1]
>         output package description
>     --publish [OPTIONAL-CHECK] [ARGUMENT=0+]
>         run npm publish
>     --publish-dev [OPTIONAL-CHECK] [ARGUMENT=0+]
>         run npm publish-dev
>   --step-package-version --S -S [OPTIONAL] [ARGUMENT=0+]
>       step up package version (expect "0.0.0-dev.0-local.0" format)
>     --sort-key --K -K [OPTIONAL-CHECK] [ARGUMENT=0+]
>         sort keys in package.json
>     --git-commit --G -G [OPTIONAL-CHECK] [ARGUMENT=0+]
>         step up main version, and prepare a git commit
>   --test-root --T -T [OPTIONAL] [ARGUMENT=1]
>       root path to look test file from, default to cwd
>     --test-file-suffix --TFS [OPTIONAL-CHECK] [ARGUMENT=1]
>         pattern for test file, default to ".js"
>     --test-require --TR [OPTIONAL-CHECK] [ARGUMENT=1+]
>         module or file to require before test files, mostly for "@babel/register"
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_DEV_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_DEV_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_INPUT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_DEV_CHECK_OUTDATED="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_TEMP="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_DEV_PACK="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_PATH_OUTPUT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_DEV_OUTPUT_NAME="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_DEV_OUTPUT_VERSION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_DEV_OUTPUT_DESCRIPTION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_DEV_PUBLISH="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_DEV_PUBLISH_DEV="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_DEV_STEP_PACKAGE_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_DEV_SORT_KEY="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_DEV_GIT_COMMIT="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_DEV_TEST_ROOT="[OPTIONAL] [ARGUMENT=1]"
>     export DR_DEV_TEST_FILE_SUFFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_DEV_TEST_REQUIRE="[OPTIONAL-CHECK] [ARGUMENT=1+]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathInput": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "checkOutdated": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathTemp": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pack": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "pathOutput": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "outputName": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "outputVersion": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "outputDescription": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "publish": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "publishDev": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "stepPackageVersion": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "sortKey": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "gitCommit": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "testRoot": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "testFileSuffix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "testRequire": [ "[OPTIONAL-CHECK] [ARGUMENT=1+]" ],
>   }
> ```

#### Resource package
📄 [resource/](resource/)
<table>
<tr><td>@babel/cli</td><td>^7.2.3</td></tr>
<tr><td>@babel/core</td><td>^7.3.3</td></tr>
<tr><td>@babel/node</td><td>^7.2.2</td></tr>
<tr><td>@babel/plugin-proposal-class-properties</td><td>^7.3.3</td></tr>
<tr><td>@babel/preset-env</td><td>^7.3.1</td></tr>
<tr><td>@babel/preset-react</td><td>^7.0.0</td></tr>
<tr><td>@babel/register</td><td>^7.0.0</td></tr>
<tr><td>babel-eslint</td><td>^10.0.1</td></tr>
<tr><td>babel-loader</td><td>^8.0.5</td></tr>
<tr><td>babel-plugin-minify-replace</td><td>^0.5.0</td></tr>
<tr><td>babel-plugin-module-resolver</td><td>^3.2.0</td></tr>
<tr><td>babel-plugin-styled-components</td><td>^1.10.0</td></tr>
<tr><td>cross-env</td><td>^5.2.0</td></tr>
<tr><td>eslint</td><td>^5.14.1</td></tr>
<tr><td>eslint-config-standard</td><td>^12.0.0</td></tr>
<tr><td>eslint-config-standard-react</td><td>^7.0.2</td></tr>
<tr><td>eslint-plugin-import</td><td>^2.16.0</td></tr>
<tr><td>eslint-plugin-node</td><td>^8.0.1</td></tr>
<tr><td>eslint-plugin-promise</td><td>^4.0.1</td></tr>
<tr><td>eslint-plugin-react</td><td>^7.12.4</td></tr>
<tr><td>eslint-plugin-standard</td><td>^4.0.0</td></tr>
<tr><td>prop-types</td><td>^15.7.2</td></tr>
<tr><td>puppeteer</td><td>^1.12.2</td></tr>
<tr><td>react</td><td>^16.8.3</td></tr>
<tr><td>styled-components</td><td>^4.1.3</td></tr>
<tr><td>terser</td><td>^3.16.1</td></tr>
<tr><td>webpack</td><td>^4.29.5</td></tr>
</table>
