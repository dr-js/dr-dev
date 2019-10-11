# @dr-js/dev

[![i:npm]][l:npm]
[![i:size]][l:size]
[![i:npm-dev]][l:npm]

A collection of strange functions, for development

[i:npm]: https://img.shields.io/npm/v/@dr-js/dev.svg
[i:npm-dev]: https://img.shields.io/npm/v/@dr-js/dev/dev.svg
[l:npm]: https://npm.im/@dr-js/dev
[i:size]: https://packagephobia.now.sh/badge?p=@dr-js/dev
[l:size]: https://packagephobia.now.sh/result?p=@dr-js/dev

- [![i:p-b]][l:p-b]
- [![i:p-br]][l:p-br]
- [![i:p-w]][l:p-w]
- [![i:p-wp]][l:p-wp]
- [![i:p-wr]][l:p-wr]
- [![i:p-wrsc]][l:p-wrsc]

[i:p-b]: https://img.shields.io/badge/@dr--js%2Fdev-babel-yellow.svg
[l:p-b]: https://npm.im/@dr-js/dev-babel
[i:p-br]: https://img.shields.io/badge/@dr--js%2Fdev-babel--react-yellow.svg
[l:p-br]: https://npm.im/@dr-js/dev-babel-react
[i:p-w]: https://img.shields.io/badge/@dr--js%2Fdev-web-blue.svg
[l:p-w]: https://npm.im/@dr-js/dev-web
[i:p-wp]: https://img.shields.io/badge/@dr--js%2Fdev-web--puppeteer-blue.svg
[l:p-wp]: https://npm.im/@dr-js/dev-web-puppeteer
[i:p-wr]: https://img.shields.io/badge/@dr--js%2Fdev-web--react-blue.svg
[l:p-wr]: https://npm.im/@dr-js/dev-web-react
[i:p-wrsc]: https://img.shields.io/badge/@dr--js%2Fdev-web--react--styled--components-blue.svg
[l:p-wrsc]: https://npm.im/@dr-js/dev-web-react-styled-components

[//]: # (NON_PACKAGE_CONTENT)

--- --- ---

- 📁 [source/](source/)
  - main source code, in output package will be:
    - `@dr-js/dev/library`: for direct use, use `require() / exports.*=`
    - `@dr-js/dev/module`: for use with `node` + `@babel/register`, keep `import / export` and readability
- 📁 [source-bin/](source-bin/)
  - bin source code, in output package will be `@dr-js/dev/bin`
- 📁 [resource/](resource/)
  - resource for pack sub package
- 📄 [SPEC.md](SPEC.md)
  - list of all directly accessible codes, sort of an API lockfile
