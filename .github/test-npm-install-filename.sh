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

# get package with filename containing "#"
wget "https://registry.npmjs.org/@dr-js/core/-/core-0.4.25.tgz" -o "dr-js-###.tgz"

# test local install
mkdir -p "./sample-package/"
( cd "./sample-package/"
  npm init -y
  npm install "../dr-js-###.tgz" || echo "!!! failed to local install"
)

# test global install
sudo npm install --global "./dr-js-###.tgz" || echo "!!! failed to global install"
