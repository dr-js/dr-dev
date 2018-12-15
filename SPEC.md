# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)
* [Resource package](#resource-package)

#### Export Path
+ 📄 [source/commonOutput.js](source/commonOutput.js)
  - `checkPublishVersion`, `getPublishFlag`, `initOutput`, `packOutput`, `publishOutput`, `verifyNoGitignore`, `verifyOutputBinVersion`
+ 📄 [source/exec.js](source/exec.js)
  - `getGitBranch`, `getGitCommitHash`, `tryExec`
+ 📄 [source/fileList.js](source/fileList.js)
  - `getFileListFromPathList`, `getScriptFileListFromPathList`
+ 📄 [source/fileProcessor.js](source/fileProcessor.js)
  - `fileProcessorBabel`, `fileProcessorWebpack`, `processFileList`
+ 📄 [source/logger.js](source/logger.js)
  - `getLogger`
+ 📄 [source/main.js](source/main.js)
  - `__VERBOSE__`, `argvFlag`, `checkFlag`, `loadEnvKey`, `runMain`, `saveEnvKey`, `syncEnvKey`
+ 📄 [source/minify.js](source/minify.js)
  - `getTerserOption`, `minifyFileListWithTerser`, `minifyWithTerser`
+ 📄 [source/puppeteer.js](source/puppeteer.js)
  - `clearPuppeteerBrowser`, `clearPuppeteerPage`, `initPuppeteerBrowser`, `initPuppeteerPage`, `runWithPuppeteer`, `testWithPuppeteerMocha`
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
>   --config -c [OPTIONAL] [ARGUMENT=1]
>       # from JSON: set to 'path/to/config.json'
>       # from ENV: set to 'env'
>   --help -h [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --version -v [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --path-input -i [OPTIONAL-CHECK] [ARGUMENT=1]
>       path to 'package.json', or directory with 'package.json' inside
>   --check-outdated -C [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-temp [OPTIONAL-CHECK] [ARGUMENT=1]
>   --pack -P [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>     --path-output -o [OPTIONAL-CHECK] [ARGUMENT=1]
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
>   --step-package-version -S [OPTIONAL] [ARGUMENT=0+]
>       step up package version (expect '0.0.0-dev.0-local.0' format)
>     --sort-key -K [OPTIONAL-CHECK] [ARGUMENT=0+]
>         sort keys in package.json
>     --git-commit -G [OPTIONAL-CHECK] [ARGUMENT=0+]
>         step up main version, and prepare a git commit
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
>   "
> JSON Usage:
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
>   }
> ```

#### Resource package
📄 [resource/](resource/)
<table>
<tr><td>@babel/cli</td><td>^7.2.0</td></tr>
<tr><td>@babel/core</td><td>^7.2.2</td></tr>
<tr><td>@babel/node</td><td>^7.2.2</td></tr>
<tr><td>@babel/plugin-proposal-class-properties</td><td>^7.2.1</td></tr>
<tr><td>@babel/preset-env</td><td>^7.2.0</td></tr>
<tr><td>@babel/preset-react</td><td>^7.0.0</td></tr>
<tr><td>@babel/register</td><td>^7.0.0</td></tr>
<tr><td>babel-eslint</td><td>^10.0.1</td></tr>
<tr><td>babel-loader</td><td>^8.0.4</td></tr>
<tr><td>babel-plugin-minify-replace</td><td>^0.5.0</td></tr>
<tr><td>babel-plugin-module-resolver</td><td>^3.1.1</td></tr>
<tr><td>babel-plugin-styled-components</td><td>^1.10.0</td></tr>
<tr><td>cross-env</td><td>^5.2.0</td></tr>
<tr><td>eslint</td><td>^5.10.0</td></tr>
<tr><td>eslint-config-standard</td><td>^12.0.0</td></tr>
<tr><td>eslint-config-standard-react</td><td>^7.0.2</td></tr>
<tr><td>eslint-plugin-import</td><td>^2.14.0</td></tr>
<tr><td>eslint-plugin-node</td><td>^8.0.0</td></tr>
<tr><td>eslint-plugin-promise</td><td>^4.0.1</td></tr>
<tr><td>eslint-plugin-react</td><td>^7.11.1</td></tr>
<tr><td>eslint-plugin-standard</td><td>^4.0.0</td></tr>
<tr><td>mocha</td><td>^5.2.0</td></tr>
<tr><td>prop-types</td><td>^15.6.2</td></tr>
<tr><td>puppeteer</td><td>^1.11.0</td></tr>
<tr><td>react</td><td>^16.6.3</td></tr>
<tr><td>styled-components</td><td>^4.1.3</td></tr>
<tr><td>terser</td><td>^3.11.0</td></tr>
<tr><td>webpack</td><td>^4.27.1</td></tr>
</table>
