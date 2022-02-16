#!/usr/bin/env bash

SCRIPT_PATH="$(node -p "path.resolve(path.dirname(process.argv[ 1 ]))" "${BASH_SOURCE[0]}")" # Absolute directory path this script is in

echo "@@ os: $(node -p "process.platform + '-' + process.arch")"
echo "@@ node: $(node --version)"
echo "@@ npm: $(npm --version)"

set -xe # enable shell command log & exit on error

# folder reset
rm -rf "${SCRIPT_PATH}/test/"
mkdir "${SCRIPT_PATH}/test/"
cd "${SCRIPT_PATH}/test/"

# create local test packages
mkdir "${SCRIPT_PATH}/test/test-pkg/"
cat > "${SCRIPT_PATH}/test/test-pkg/package.json" << 'EOL'
{
  "name": "test-pkg",
  "version": "0.0.0",
  "peerDependencies": {
    "react-dom": "^17.0.2"
  }
}
EOL
( cd "${SCRIPT_PATH}/test/" && npm pack "./test-pkg/" ) # output as "test-pkg-0.0.0.tgz"

mkdir "${SCRIPT_PATH}/test/test-install/"
cat > "${SCRIPT_PATH}/test/test-install/package.json" << 'EOL'
{
  "name": "test-install",
  "version": "0.0.0",
  "dependencies": {
    "test-pkg": "../test-pkg-0.0.0.tgz"
  }
}
EOL

cp -aT "${SCRIPT_PATH}/test/test-install/" "${SCRIPT_PATH}/test/test-install-0/"
cp -aT "${SCRIPT_PATH}/test/test-install/" "${SCRIPT_PATH}/test/test-install-1/"
cp -aT "${SCRIPT_PATH}/test/test-install/" "${SCRIPT_PATH}/test/test-install-2/"

( cd "${SCRIPT_PATH}/test/test-install-0/"
  npm install --strict-peer-deps
  node -p "['#'.repeat(64), '[PASS] base package can install', '#'.repeat(64) ].join('\n')"
)

( cd "${SCRIPT_PATH}/test/test-install-1/"
  npm install --strict-peer-deps react@16 || node -p "['#'.repeat(64), '[PASS] bad tree found on fresh install', '#'.repeat(64) ].join('\n')"
)

( cd "${SCRIPT_PATH}/test/test-install-2/"
  npm install --strict-peer-deps
  npm install --strict-peer-deps react@16
  npm ls --all || node -p "['#'.repeat(64), '[BUG] bad tree missed on incremental install', '#'.repeat(64) ].join('\n')"
)
