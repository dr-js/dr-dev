# dr-dev

[![i:npm]][l:npm]
[![i:size]][l:size]
[![i:npm-dev]][l:npm]

A collection of strange functions, for development

[i:npm]: https://img.shields.io/npm/v/dr-dev.svg
[i:npm-dev]: https://img.shields.io/npm/v/dr-dev/dev.svg
[l:npm]: https://npm.im/dr-dev
[i:size]: https://packagephobia.now.sh/badge?p=dr-dev
[l:size]: https://packagephobia.now.sh/result?p=dr-dev

- [![i:p-b]][l:p-b]
- [![i:p-br]][l:p-br]
- [![i:p-w]][l:p-w]
- [![i:p-wp]][l:p-wp]
- [![i:p-wr]][l:p-wr]
- [![i:p-wrsc]][l:p-wrsc]

[i:p-b]: https://img.shields.io/badge/dr--dev-babel-yellow.svg
[l:p-b]: https://npm.im/dr-dev-babel
[i:p-br]: https://img.shields.io/badge/dr--dev-babel--react-yellow.svg
[l:p-br]: https://npm.im/dr-dev-babel-react
[i:p-w]: https://img.shields.io/badge/dr--dev-web-blue.svg
[l:p-w]: https://npm.im/dr-dev-web
[i:p-wp]: https://img.shields.io/badge/dr--dev-web--puppeteer-blue.svg
[l:p-wp]: https://npm.im/dr-dev-web-puppeteer
[i:p-wr]: https://img.shields.io/badge/dr--dev-web--react-blue.svg
[l:p-wr]: https://npm.im/dr-dev-web-react
[i:p-wrsc]: https://img.shields.io/badge/dr--dev-web--react--styled--components-blue.svg
[l:p-wrsc]: https://npm.im/dr-dev-web-react-styled-components

[//]: # (NON_PACKAGE_CONTENT)

--- --- ---

- 📁 [source/](source/)
  - main source code, in output package will be:
    - `dr-dev/library`: for direct use, use `require() / exports.*=`
    - `dr-dev/module`: for use with `node` + `@babel/register`, keep `import / export` and readability
- 📁 [source-bin/](source-bin/)
  - bin source code, in output package will be `dr-dev/bin`
- 📁 [resource/](resource/)
  - resource for pack sub package
- 📁 [config/](config/)
  - config for pack sub package
- 📄 [SPEC.md](SPEC.md)
  - list of all directly accessible codes, sort of an API lockfile
