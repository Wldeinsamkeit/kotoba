#!/bin/sh
set -euxo pipefail

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_AUTO_UPDATE=TRUE
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@20/bin:/usr/local/opt/node@20/bin:/usr/local/bin:$PATH"

cd "$CI_PRIMARY_REPOSITORY_PATH"

PUBLIC_DIR="ios/App/App/public"
CONFIG_XML="ios/App/App/config.xml"
CAP_CONFIG="ios/App/App/capacitor.config.json"

if [ ! -d "$PUBLIC_DIR" ] || [ ! -f "$CONFIG_XML" ] || [ ! -f "$CAP_CONFIG" ]; then
  echo "⚠️ Capacitor assets missing before xcodebuild; rebuilding web + sync"
  if ! command -v node >/dev/null 2>&1 || ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit((major === 20 && minor >= 19) || major >= 22 ? 0 : 1)' >/dev/null 2>&1; then
    brew install node@20
    export PATH="/opt/homebrew/opt/node@20/bin:/usr/local/opt/node@20/bin:$PATH"
    hash -r
  fi
  npm ci
  npm run build
  npx cap sync ios
fi

test -d "$PUBLIC_DIR"
test -f "$CONFIG_XML"
test -f "$CAP_CONFIG"
echo "✅ Capacitor assets verified before Archive"
