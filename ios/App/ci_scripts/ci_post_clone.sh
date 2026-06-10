#!/bin/sh
set -e

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE

echo "📦 Install Node.js (Xcode Cloud)"
if ! command -v node >/dev/null 2>&1; then
  brew install node@22
  brew link node@22
fi

echo "Node $(node -v), npm $(npm -v)"

cd "$CI_PRIMARY_REPOSITORY_PATH"

echo "📦 Install npm dependencies"
npm ci

echo "🏗️ Build web app (dist/)"
npm run build

echo "🔄 Sync Capacitor iOS bundle (public + capacitor.config.json)"
npx cap sync ios

echo "✅ Capacitor sync complete"
