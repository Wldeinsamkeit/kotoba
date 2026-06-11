#!/bin/sh
set -euxo pipefail

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_AUTO_UPDATE=TRUE
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@20/bin:/usr/local/opt/node@20/bin:/usr/local/bin:$PATH"

echo "📍 CI_PRIMARY_REPOSITORY_PATH=$CI_PRIMARY_REPOSITORY_PATH"
cd "$CI_PRIMARY_REPOSITORY_PATH"

ensure_node_20() {
  if command -v node >/dev/null 2>&1 && node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit((major === 20 && minor >= 19) || major >= 22 ? 0 : 1)' >/dev/null 2>&1; then
    return 0
  fi

  echo "📦 Installing Node.js 20 via Homebrew"
  brew install node@20
  export PATH="/opt/homebrew/opt/node@20/bin:/usr/local/opt/node@20/bin:$PATH"
  hash -r
}

ensure_node_20

echo "Node $(node -v), npm $(npm -v)"

echo "📦 npm ci"
npm ci

echo "🏗️ npm run build"
npm run build

echo "🔄 npx cap sync ios"
npx cap sync ios

echo "🔍 Verify Capacitor iOS assets"
test -d ios/App/App/public
test -f ios/App/App/config.xml
test -f ios/App/App/capacitor.config.json
ls -la ios/App/App/public | head -20
echo "✅ Capacitor sync complete"
