#!/bin/sh
set -euxo pipefail

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_AUTO_UPDATE=TRUE
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/node/bin:/usr/local/opt/node/bin:/usr/local/bin:$PATH"

echo "📍 CI_PRIMARY_REPOSITORY_PATH=$CI_PRIMARY_REPOSITORY_PATH"
cd "$CI_PRIMARY_REPOSITORY_PATH"

ensure_node_22() {
  if command -v node >/dev/null 2>&1 && node -e 'const [major] = process.versions.node.split(".").map(Number); process.exit(major >= 22 ? 0 : 1)' >/dev/null 2>&1; then
    return 0
  fi

  echo "📦 Installing latest Node.js via Homebrew"
  brew install node
  export PATH="/opt/homebrew/opt/node/bin:/usr/local/opt/node/bin:$PATH"
  hash -r

  node -e 'const [major] = process.versions.node.split(".").map(Number); if (major < 22) { console.error(`Node ${process.versions.node} is too old; Capacitor CLI requires >=22.`); process.exit(1); }'
}

ensure_node_22

echo "Node $(node -v), npm $(npm -v)"

run_with_retry() {
  label="$1"
  max_attempts="$2"
  delay_seconds="$3"
  shift 3
  attempt=1

  while [ "$attempt" -le "$max_attempts" ]; do
    echo "🔁 $label attempt $attempt/$max_attempts"
    if "$@"; then
      return 0
    fi

    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "❌ $label failed after $max_attempts attempts"
      return 1
    fi

    echo "⏳ $label failed; retrying in ${delay_seconds}s"
    sleep "$delay_seconds"
    attempt=$((attempt + 1))
  done
}

echo "📦 npm ci"
npm ci

echo "🏗️ npm run build"
npm run build

echo "🔄 npx cap sync ios"
run_with_retry "npx cap sync ios" 3 30 npx cap sync ios

echo "🔍 Verify Capacitor iOS assets"
test -d ios/App/App/public
test -f ios/App/App/config.xml
test -f ios/App/App/capacitor.config.json
ls -la ios/App/App/public | head -20
echo "✅ Capacitor sync complete"
