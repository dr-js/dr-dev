import { readFileSync, existsSync } from 'fs'
import { hostname } from 'os'

import { describe } from '@dr-js/core/module/common/format.js'
import { isBasicArray, isBasicFunction, isBasicObject, isString } from '@dr-js/core/module/common/check.js'
import { getUTCDateTag } from '@dr-js/core/module/common/time.js'
import { resolveHome } from '@dr-js/core/module/node/fs/Path.js'
import { resolveCommand } from '@dr-js/core/module/node/system/ResolveCommand.js'
import { runSync, runStdoutSync } from '@dr-js/core/module/node/run.js'

const doShellAlias = async ({
  aliasName,
  aliasArgList = [],
  log
}) => {
  if ([ 'h', 'help', 'l', 'list' ].includes(aliasName)) return log && log(Object.keys(SHELL_ALIAS_LIST).join('\n'))

  const runBase = (commandStringOrArgList, argList = []) => {
    let commandList = [
      ...(isString(commandStringOrArgList) ? commandStringOrArgList.split(' ') : commandStringOrArgList),
      ...argList
    ]
    log && log(` - run: ${commandList.join(' ')}`)
    if (process.platform === 'win32') {
      if (commandList[ 0 ] === 'sudo') commandList = commandList.slice(1) // drop sudo on win32 // TODO: also drop for Termux?
      commandList[ 0 ] = resolveCommand(commandList[ 0 ]) // resolve file for windows
    }
    runSync(commandList)
  }
  const runAlias = (alias, argList = [], name) => {
    if (isBasicFunction(alias)) {
      alias = alias(...aliasArgList) // NOTE: always use input arg list
      argList = [] // drop argList
    }
    if (isBasicObject(alias)) {
      if (alias.A) runAliasName(alias.A, [ ...alias.$, ...argList ])
      else if (alias.AE) for (const subAliasName of alias.AE) runAliasName(subAliasName, []) // drop argList
      else if (alias.E) for (const subAlias of alias.E) runAlias(subAlias, [], name) // drop argList
      else throw new Error(`invalid alias object: ${describe(alias)} from aliasName: ${name}`)
      return
    }
    if (isString(alias) || isBasicArray(alias)) return runBase(alias, argList)
    throw new Error(`invalid alias: ${describe(alias)} from aliasName: ${name}`)
  }
  const runAliasName = (aliasName, argList = []) => {
    const alias = SHELL_ALIAS_LIST[ aliasName ]
    if (!alias) throw new Error(`invalid aliasName: ${aliasName}`)
    runAlias(alias, argList, aliasName)
  }

  runAliasName(aliasName, aliasArgList)
}

// base: when single command run, append `argList` if any
//   [ stringArg ]: direct run without shell
//   stringCommand: split by " " to get `[ stringArg ]`
// extend:
//   { E: [ base ] }: run each without shell
// generated:
//   (...argList) => base|extend: generated command
//   { A: stringAlias, $: [] }: run base alias and append `$`
//   { AE: [ stringAlias ] }: run each alias
const _E = (...baseList) => ({ E: baseList })
const _A = (stringAlias, ...$List) => ({ A: stringAlias, $: $List })
const _AE = (...stringAliasList) => ({ AE: stringAliasList })

const IS_ANDROID_TERMUX = (process.env.PREFIX || '').includes('com.termux') // termux: https://www.reddit.com/r/termux/comments/co46qw/how_to_detect_in_a_bash_script_that_im_in_termux/ewi3fjj/
const GET_LINUX_PACKAGE_MANAGER = () => { // LSB linux: https://serverfault.com/questions/879216/how-to-detect-linux-distribution-and-version/880087#880087
  if (cacheLinuxPackageManage === undefined) {
    const nameLinuxRelease = IS_ANDROID_TERMUX ? 'Android (Termux)'
      : (existsSync('/etc/os-release') && (/\s"?NAME"?="?([\w/)( ]+)"?/.exec(String(readFileSync('/etc/os-release'))) || [])[ 1 ]) || 'non-LSB'
    cacheLinuxPackageManage = [ 'Arch Linux', 'Arch Linux ARM' ].includes(nameLinuxRelease) ? 'pacman'
      : [ 'Ubuntu', 'Debian GNU/Linux', 'Raspbian GNU/Linux', 'Android (Termux)' ].includes(nameLinuxRelease) ? 'apt'
        : 'unknown'
    __DEV__ && console.log('GET_LINUX_PACKAGE_MANAGER', { nameLinuxRelease, cacheLinuxPackageManage })
  }
  return cacheLinuxPackageManage
}
let cacheLinuxPackageManage

const SHELL_ALIAS_LIST = {
  // picked from: https://github.com/dr-js/stash/blob/master/bash/bash-aliases-extend.sh

  // =============================
  // screen clear aliases, should be supported in xterm/VT100
  // https://apple.stackexchange.com/questions/31872/how-do-i-reset-the-scrollback-in-the-terminal-via-a-shell-command/318217#318217
  'CLS': 'printf \\e[2J\\e[3J\\e[H',

  // =============================
  // git aliases (G*)
  ...{
    'git-fetch': 'git fetch',
    'git-fetch-all': 'git fetch --all --tags',
    'git-git-combo': 'git fetch --prune', // # no `--prune-tags`
    'git-git-git-combo': _E('git fetch --prune', 'git gc --auto'),
    'git-git-git-git-combo': _E('git fetch --prune', 'git gc --prune=now'),
    'git-status': 'git status',
    'git-push': 'git push',
    'git-push-force': 'git push --force',
    'git-reset-hard': 'git reset --hard @{upstream}',
    'git-git-reset-head': _AE('git-git-combo', 'git-reset-hard'),
    'git-branch-list': 'git branch --all --list', // local and remote
    'git-branch-delete': 'git branch -D',
    'git-checkout-branch-remote': 'git checkout --track', // $1=remove-branch-name # create and switch to a local branch tracking the remote
    'git-cherry-pack-range': ($1, $2) => [ 'git', 'cherry-pick', `${$1}^..${$2}` ], // $1=commit-from, $2=commit-to # will include both from/to commit
    'git-cherry-pack-abort': 'git cherry-pick --abort',
    'git-cherry-pack-continue': 'git cherry-pick --continue',
    'git-clear': _E('git remote prune origin', 'git gc --prune=now'),
    'git-commit': 'git commit',
    'git-commit-amend': 'git commit --amend',
    'git-clone': 'git clone',
    'git-clone-minimal': 'git clone --depth 1 --no-tags --config remote.origin.fetch=+refs/heads/master:refs/remotes/origin/master',
    'git-tag-combo': ($1) => _E([ 'git', 'tag', '--force', $1 ], [ 'git', 'push', 'origin', $1 ]),
    'git-tag-clear-local': () => [ 'git', 'tag', '--delete', ...String(runStdoutSync([ 'git', 'tag', '-l' ])).split('\n') ],
    'git-tag-push-origin': 'git push origin', // append the tag name
    'git-tag-push-force-origin': 'git push --force origin', // append the tag name
    'git-tag-delete-origin': 'git push --delete origin', // append the tag name (or full name like `refs/tags/v0.4.2`)
    'git-ls-files-stage': 'git ls-files --stage',
    'git-update-644': 'git update-index --chmod=-x',
    'git-update-755': 'git update-index --chmod=+x',
    'git-log': 'git log',
    'git-log-16': _A('git-log', '-16'),
    'git-log-oneline': [ 'git', 'log', '--date=short', '--pretty=format:%C(auto,yellow)%h %C(auto,blue)%>(12,trunc)%ad %C(auto,green)%<(7,trunc)%aN%C(auto,reset)%s%C(auto,red)% gD% D' ],
    'git-log-oneline-16': _A('git-log-oneline', '-16'),
    'git-log-graph': 'git log --graph --oneline',
    'git-log-graph-16': _A('git-log-graph', '-16'),

    'GF': _A('git-fetch'),
    'GFA': _A('git-fetch-all'),
    'GG': _A('git-git-combo'),
    'GGG': _A('git-git-git-combo'),
    'GGGG': _A('git-git-git-git-combo'),
    'GS': _A('git-status'),
    'GP': _A('git-push'),
    'GPF': _A('git-push-force'),
    'GRH': _A('git-reset-hard'),
    'GGRH': _A('git-git-reset-head'),
    'GBL': _A('git-branch-list'),
    'GBD': _A('git-branch-delete'),
    'GCBR': _A('git-checkout-branch-remote'),
    'GCPR': _A('git-cherry-pack-range'),
    'GCPA': _A('git-cherry-pack-abort'),
    'GCPC': _A('git-cherry-pack-continue'),
    'GC': _A('git-clear'),
    'GCM': _A('git-commit'),
    'GCMA': _A('git-commit-amend'),
    'GCLO': _A('git-clone'),
    'GCLOM': _A('git-clone-minimal'),
    'GTC': _A('git-tag-combo'),
    'GTCL': _A('git-tag-clear-local'),
    'GTPO': _A('git-tag-push-origin'),
    'GTPFO': _A('git-tag-push-force-origin'),
    'GTDO': _A('git-tag-delete-origin'),
    'GLS': _A('git-ls-files-stage'),
    'G644': _A('git-update-644'),
    'G755': _A('git-update-755'),
    'GL': _A('git-log'),
    'GL16': _A('git-log-16'),
    'GLO': _A('git-log-oneline'),
    'GLO16': _A('git-log-oneline-16'),
    'GLG': _A('git-log-graph'),
    'GLG16': _A('git-log-graph-16')
  },

  // =============================
  // systemd aliases (SD*,SR*)
  ...{
    'systemd-list-active': 'sudo systemctl list-units --type=service --state=active',
    'systemd-list-enabled': 'sudo systemctl list-unit-files --type=service --state=enabled,generated',
    'systemd-list-timers': 'sudo systemctl list-timers',
    'systemd-daemon-reload': 'sudo systemctl daemon-reload',
    'systemd-reset-failed': 'sudo systemctl reset-failed', // https://serverfault.com/questions/606520/how-to-remove-missing-systemd-units
    'systemd-start': 'sudo systemctl start',
    'systemd-stop': 'sudo systemctl stop',
    'systemd-status': 'sudo systemctl status',
    'systemd-enable': 'sudo systemctl enable',
    'systemd-disable': 'sudo systemctl disable',
    'systemd-restart': 'sudo systemctl restart',
    'systemd-reload': 'sudo systemctl reload',

    'SDLA': _A('systemd-list-active'),
    'SDLE': _A('systemd-list-enabled'),
    'SDLT': _A('systemd-list-timers'),
    'SDDR': _A('systemd-daemon-reload'),
    'SDRF': _A('systemd-reset-failed'),
    'SDON': _A('systemd-start'),
    'SDOFF': _A('systemd-stop'),
    'SDS': _A('systemd-status'),
    'SDE': _A('systemd-enable'),
    'SDD': _A('systemd-disable'),
    'SDRS': _A('systemd-restart'),
    'SDRL': _A('systemd-reload'),

    'systemd-resolve-flush-caches': 'sudo systemd-resolve --flush-caches',
    'systemd-resolve-statistics': 'sudo systemd-resolve --statistics',
    'systemd-resolvectl-status': 'sudo resolvectl status',
    'systemd-journalctl-vacuum': [ 'sudo journalctl --flush --rotate', 'sudo journalctl --vacuum-size=0.5G' ],

    'SRFC': _A('systemd-resolve-flush-caches'),
    'SRS': _A('systemd-resolve-statistics'),
    'SRCS': _A('systemd-resolvectl-status'),
    'SJV': _A('systemd-journalctl-vacuum')
  },

  // =============================
  // npm aliases (N*)
  ...{
    'npm-list-global': 'npm ls --global --depth=0',
    'npm-install': 'npm install',
    'npm-install-global': 'sudo npm install --global',
    'npm-install-prefer-offline': 'npm install --prefer-offline',
    'npm-install-package-lock-only': 'npm install --package-lock-only',
    'npm-outdated': 'npm outdated',
    'npm-dedup-install': [ 'npm ddp', 'npm install --prefer-offline' ],
    'npm-audit': 'npm audit',
    'npm-audit-fix': 'npm audit fix',
    'npm-run': 'npm run',

    'NLSG': _A('npm-list-global'),
    'NI': _A('npm-install'),
    'NIG': _A('npm-install-global'),
    'NIO': _A('npm-install-prefer-offline'),
    'NIPLO': _A('npm-install-package-lock-only'),
    'NO': _A('npm-outdated'),
    'NDI': _A('npm-dedup-install'),
    'NA': _A('npm-audit'),
    'NAF': _A('npm-audit-fix'),
    'NR': _A('npm-run')
  },

  // =============================
  // docker aliases (DC*,DI*,DV*)
  ...{
    'docker-container-run': 'sudo docker container run',
    'docker-container-run-bash': 'sudo docker container run --interactive --tty --rm --entrypoint /bin/bash',
    'docker-container-exec': 'sudo docker container exec',
    'docker-container-exec-bash': ($1) => [ 'sudo', 'docker', 'container', 'exec', '--interactive', '--tty', $1, '/bin/bash' ], //  $1=container name or id
    'docker-container-attach': 'sudo docker container attach',
    'docker-container-ls': 'sudo docker container ls',
    'docker-container-ls-all': 'sudo docker container ls --all',
    'docker-container-ls-minimal': [ 'sudo', 'docker', 'container', 'ls', '--format=table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.State}}' ],
    'docker-container-logs': 'sudo docker container logs',
    'docker-container-logs-tail': 'sudo docker container logs --follow --tail=10',
    'docker-container-top': 'sudo docker container top',
    'docker-container-rm': 'sudo docker container rm',
    'docker-container-prune': 'sudo docker container prune',
    'docker-container-prune-force': 'sudo docker container prune --force',
    'docker-container-kill': 'sudo docker container kill',
    'docker-container-stop': 'sudo docker container stop',
    'docker-container-stats': 'sudo docker container stats --no-stream --no-trunc',
    'docker-container-inspect': 'sudo docker container inspect',
    'docker-container-commit': 'sudo docker container commit',

    'DCR': _A('docker-container-run'),
    'DCRB': _A('docker-container-run-bash'),
    'DCE': _A('docker-container-exec'),
    'DCEB': _A('docker-container-exec-bash'),
    'DCA': _A('docker-container-attach'),
    'DCLS': _A('docker-container-ls'),
    'DCLA': _A('docker-container-ls-all'),
    'DCLM': _A('docker-container-ls-minimal'),
    'DCLOG': _A('docker-container-logs'),
    'DCLOGT': _A('docker-container-logs-tail'),
    'DCTOP': _A('docker-container-top'),
    'DCRM': _A('docker-container-rm'),
    'DCP': _A('docker-container-prune'),
    'DCPF': _A('docker-container-prune-force'),
    'DCKILL': _A('docker-container-kill'),
    'DCSTOP': _A('docker-container-stop'),
    'DCS': _A('docker-container-stats'),
    'DCI': _A('docker-container-inspect'),
    'DCC': _A('docker-container-commit'),

    'docker-image-build': 'sudo docker image build',
    'docker-image-push': 'sudo docker image push',
    'docker-image-pull': 'sudo docker image pull',
    'docker-image-load': 'sudo docker image load',
    'docker-image-save': 'sudo docker image save',
    'docker-image-ls': 'sudo docker image ls',
    'docker-image-ls-all': 'sudo docker image ls --all',
    'docker-image-ls-tag': 'sudo docker image ls --format={{.Repository}}:{{.Tag}}',
    'docker-image-rm': 'sudo docker image rm',
    'docker-image-prune': 'sudo docker image prune',
    'docker-image-prune-force': 'sudo docker image prune --force',
    'docker-image-history': 'sudo docker image history',
    'docker-image-inspect': 'sudo docker image inspect',

    'DIB': _A('docker-image-build'),
    'DIPUSH': _A('docker-image-push'),
    'DIPULL': _A('docker-image-pull'),
    'DILOAD': _A('docker-image-load'),
    'DISAVE': _A('docker-image-save'),
    'DILS': _A('docker-image-ls'),
    'DILA': _A('docker-image-ls-all'),
    'DILT': _A('docker-image-ls-tag'),
    'DIRM': _A('docker-image-rm'),
    'DIP': _A('docker-image-prune'),
    'DIPF': _A('docker-image-prune-force'),
    'DIH': _A('docker-image-history'),
    'DII': _A('docker-image-inspect'),

    'docker-volume-ls': 'sudo docker volume ls',
    'docker-volume-rm': 'sudo docker volume rm',
    'docker-volume-create': 'sudo docker volume create',
    'docker-volume-inspect': 'sudo docker volume inspect',

    'DVLS': _A('docker-volume-ls'),
    'DVRM': _A('docker-volume-rm'),
    'DVC': _A('docker-volume-create'),
    'DVI': _A('docker-volume-inspect')
  },

  // =============================
  // screen aliases (S*)
  'screen-resume': 'screen -R',
  'screen-list': 'screen -ls',

  'SR': _A('screen-resume'),
  'SL': _A('screen-list'),

  // =============================
  // nano aliases (NN*)
  'nano-reset': ($1) => _E( // $1=file-to-reset-and-edit
    [ 'truncate', '--size=0', $1 ],
    [ 'nano', $1 ]
  ),
  'NNR': _A('nano-reset'),

  // =============================
  // quick aliases (Q*)
  'quick-dd-random': ($1 = '100') => [ 'dd', 'bs=1048576', `count=${$1}`, 'if=/dev/urandom', `of=./RANDOM-${$1}MiB` ], // $1=size-in-MiB-default-to-100
  'quick-shutdown': 'sudo shutdown 0',
  'quick-reboot': 'sudo reboot',
  'quick-df': 'df -h',
  'quick-df-current': 'df -h .',
  'quick-du': 'du -hd1',
  'quick-ssh-key-md5-list': [ 'ssh-keygen', '-E', 'md5', '-lf', resolveHome('~/.ssh/authorized_keys') ],
  'quick-ssh-keygen': (
    $1 = `KEY_${getUTCDateTag()}_4096`, // TZ=UTC0 date +%Y%m%d
    $2 = `${$1}@${hostname() || 'unknown-host'}`
  ) => _E(
    [ 'ssh-keygen', '-t', 'rsa', '-b', '4096', '-N', '', '-f', `./${$1}.pri`, '-C', $2 ],
    [ 'mv', `./${$1}.pri.pub`, `./${$1}.pub` ]
  ),
  'quick-list-listen-socket': 'sudo ss -tulnp', // command from `iproute2`, use `sudo` to get full pid info
  'quick-system-watch': () => [ 'watch', '--no-title', existsSync('/sys/class/thermal/thermal_zone0')
    ? 'echo == cpufreq ==; cat /sys/devices/system/cpu/cpufreq/policy*/scaling_cur_freq; echo == thermal ==; cat /sys/class/thermal/thermal_zone*/temp;'
    : 'grep "cpu MHz" /proc/cpuinfo'
  ],
  'quick-drop-caches': _E(
    'sync',
    [ 'sudo', 'bash', '-c', 'echo 1 > /proc/sys/vm/drop_caches' ]
  ),
  'quick-sudo-bash': 'sudo bash',
  'quick-git-diff': 'git diff --no-index --', // $1=old $2=new
  'quick-git-tag-push': () => {
    const TAG = `v${JSON.parse(String(readFileSync('package.json'))).version}`
    return _E([ 'git', 'tag', TAG ], [ 'git', 'push', 'origin', TAG ])
  },
  'quick-git-tag-push-force': () => {
    const TAG = `v${JSON.parse(String(readFileSync('package.json'))).version}`
    return _E([ 'git', 'tag', '--force', TAG ], [ 'git', 'push', 'origin', '--force', TAG ])
  },
  'quick-git-push-combo': _AE('git-push', 'quick-git-tag-push'),
  'quick-git-push-combo-force': _AE('git-push-force', 'quick-git-tag-push-force'),

  'QDDR': _A('quick-dd-random'),
  'QSHUTDOWN': _A('quick-shutdown'),
  'QREBOOT': _A('quick-reboot'),
  'QDF': _A('quick-df'),
  'QDFC': _A('quick-df-current'),
  'QDU': _A('quick-du'),
  'QSKML': _A('quick-ssh-key-md5-list'),
  'QSKG': _A('quick-ssh-keygen'),
  'QLLS': _A('quick-list-listen-socket'),
  'QSW': _A('quick-system-watch'),
  'QRBG': _A('quick-run-background'),
  'QDC': _A('quick-drop-caches'),
  'QSB': _A('quick-sudo-bash'),
  'QGD': _A('quick-git-diff'),
  'QGTP': _A('quick-git-tag-push'),
  'QGTPF': _A('quick-git-tag-push-force'),
  'QGPC': _A('quick-git-push-combo'),
  'QGPCF': _A('quick-git-push-combo-force'),

  // =============================
  // @dr-js aliases (D*)
  'dr-js-npm-install-global-all': 'sudo npm i -g @dr-js/core @dr-js/dev',
  'dr-js-npm-install-global-all-dev': 'sudo npm i -g @dr-js/core@dev @dr-js/dev@dev',
  'dr-js-package-reset': 'dr-js --rm package-lock.json node_modules',
  'dr-js-package-reset-combo': _AE('dr-js-package-reset', 'npm-install'),
  'dr-js-package-reset-combo-combo': _AE('dr-js-package-reset', 'npm-install-prefer-offline'),

  'DNIGA': _A('dr-js-npm-install-global-all'),
  'DNIGAD': _A('dr-js-npm-install-global-all-dev'),
  'DPR': _A('dr-js-package-reset'),
  'DPRC': _A('dr-js-package-reset-combo'),
  'DPRCC': _A('dr-js-package-reset-combo-combo'),

  // =============================
  // =============================
  // linux release dependent alias
  // =============================
  // =============================
  //
  // =============================
  // system aliases (S*)
  ...(GET_LINUX_PACKAGE_MANAGER() === 'pacman' && {
    'system-package-list-all': 'sudo pacman -Q',
    'system-package-list': 'sudo pacman -Qe', // explicitly installed
    'system-package-update': _E(
      'sudo pacman -Sy --needed archlinux-keyring',
      'sudo pacman -Syu',
      () => {
        const orphanPackageList = String(runStdoutSync('pacman -Qtdq')).trim().split('\n')
        return orphanPackageList.length
          ? [ 'sudo', 'pacman', '-Rns', ...orphanPackageList ]
          : [ 'echo', 'nothing to clear' ]
      }
    ),
    'system-package-remove': 'sudo pacman -R',
    'system-package-install': 'sudo pacman -S --needed',
    'system-package-provide-bin': ($1) => [ 'sudo', 'pacman', '-F', resolveCommand($1) ], // $1=bin-name-or-full-path // https://unix.stackexchange.com/questions/14858/in-arch-linux-how-can-i-find-out-which-package-to-install-that-will-contain-file
    'system-package-why': 'sudo pacman -Qi', // check the `Required By` row
    'system-reboot-required': () => {
      // hacky node version for: https://bbs.archlinux.org/viewtopic.php?id=173508
      // NOTE: for ArchLinuxARM `uname -r` will print extra `-ARCH`
      const installedVersion = String(runStdoutSync([ 'pacman', '-Q', 'linux' ])).trim().split(' ').pop() // pick "5.13.10.arch1-1" from "linux 5.13.10.arch1-1"
      const runningVersion = String(runStdoutSync([ 'uname', '-r' ]))
      const formatVersion = (v) => v.replace(/\W/g, '.').toLowerCase()
      return [ 'echo', formatVersion(runningVersion).startsWith(formatVersion(installedVersion)) ? 'nope' : 'Reboot Required' ]
    }
  }),

  ...(GET_LINUX_PACKAGE_MANAGER() === 'apt' && {
    'system-package-list-all': 'sudo apt list --installed',
    'system-package-list': 'sudo apt-mark showmanual',
    'system-package-update': _E('sudo apt update', 'sudo apt upgrade -y', 'sudo apt autoremove --purge -y'),
    'system-package-remove': 'sudo apt autoremove --purge',
    'system-package-install': 'sudo apt install',
    'system-package-provide-bin': ($1) => [ 'sudo', 'dpkg', '-S', resolveCommand($1) ], // $1=bin-name-or-full-path // https://serverfault.com/questions/30737/how-do-i-find-the-package-that-contains-a-given-program-on-ubuntu
    'system-package-why': 'sudo apt-cache rdepends --no-suggests --no-conflicts --no-breaks --no-replaces --no-enhances --installed --recurse', // https://askubuntu.com/questions/5636/can-i-see-why-a-package-is-installed#comment505140_5637
    'system-reboot-required': () => [ 'echo', existsSync('/var/run/reboot-required') ? 'nope' : 'Reboot Required' ]
  }),

  'SPLA': _A('system-package-list-all'),
  'SPL': _A('system-package-list'),
  'SPU': _A('system-package-update'),
  'SPR': _A('system-package-remove'),
  'SPI': _A('system-package-install'),
  'SPPB': _A('system-package-provide-bin'),
  'SPWHY': _A('system-package-why'),
  'SRR': _A('system-reboot-required')
}

export { doShellAlias }