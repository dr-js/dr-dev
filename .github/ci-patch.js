const { resolve } = require('path')
const { release, arch, homedir } = require('os')
const { run } = require('@dr-js/core/library/node/run')
const { getPathNpm } = require('@dr-js/node/library/module/Software/npm')
const { runMain } = require('@dr-js/dev/library/main')

const PATH_ROOT = resolve(__dirname, '../')
const IS_WIN32 = process.platform === 'win32'
const COMMAND_SUDO_NPM = IS_WIN32 ? 'npm.cmd' : 'sudo npm' // win32 has no sudo & need .cmd extension

runMain(async ({ log, padLog }) => {
  padLog('Log info')
  log(`system: ${process.platform}-${release()}[${arch()}]`)
  log(`node: ${process.version}`)
  log(`npm: ${require(resolve(getPathNpm(), './package')).version}`)
  log(`with: ${[ '@dr-js/core', '@dr-js/node', '@dr-js/dev' ].map((v) => `${v}@${require(`${v}/package`).version}`).join(', ')}`)
  log(`extra: ${JSON.stringify({ PATH_ROOT, IS_WIN32, COMMAND_SUDO_NPM })}`)

  const RUN = async (argListOrString) => {
    const argList = Array.isArray(argListOrString) ? argListOrString : argListOrString.split(' ').filter(Boolean)
    log(`[RUN] "${argList.join(' ')}"`)
    await run(argList, { cwd: PATH_ROOT }).promise
  }

  if (IS_WIN32) {
    padLog('Patch git') // fix win32 CI cause `something to commit` test error: https://github.com/actions/checkout/issues/135#issuecomment-602171132
    await RUN('git config core.autocrlf false')
    await RUN('git config core.eol lf')
    await RUN('git rm --cached -r .') // reset Git index, `rm .git/index` also work, check: https://stackoverflow.com/questions/5787937/git-status-shows-files-as-changed-even-though-contents-are-the-same/41041699#41041699
    await RUN('git reset --hard')
  }

  padLog('Patch npm cache path') // set cache path to `~/.npm/` for all platform (only win32 for now)
  await RUN([ ...`${COMMAND_SUDO_NPM} config set cache`.split(' '), resolve(homedir(), '.npm/'), '--global' ])

  padLog('Patch install "@dr-js/dev" globally')
  await RUN(`${COMMAND_SUDO_NPM} install --global @dr-js/dev@0.4`)
}, 'ci-patch')
