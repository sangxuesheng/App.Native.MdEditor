#!/bin/bash

# Fast FPK build:
# - Build from a temporary staging directory
# - Keep only runtime-required files
# - Reduce app.tgz size and installation chown scan time

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="App.Native.MdEditor2"
OUTPUT_FPK="${APP_NAME}.fpk"

export PATH=/var/apps/nodejs_v22/target/bin:$PATH

log() { echo "[fast-pack] $*"; }

require_file() {
  local p="$1"
  [ -e "$p" ] || { echo "missing required path: $p" >&2; exit 1; }
}

require_file "$ROOT_DIR/manifest"
require_file "$ROOT_DIR/ICON.PNG"
require_file "$ROOT_DIR/ICON_256.PNG"
require_file "$ROOT_DIR/cmd"
require_file "$ROOT_DIR/config"
require_file "$ROOT_DIR/wizard"
require_file "$ROOT_DIR/app/server"
require_file "$ROOT_DIR/app/ui/frontend/dist"

STAGE_DIR="$(mktemp -d /tmp/md2-fast-pack.XXXXXX)"
cleanup() { rm -rf "$STAGE_DIR"; }
trap cleanup EXIT

log "staging into $STAGE_DIR"

mkdir -p "$STAGE_DIR/app/ui/frontend" "$STAGE_DIR/app/ui" "$STAGE_DIR/app"

# Required top-level package metadata
cp -a "$ROOT_DIR/manifest" "$ROOT_DIR/ICON.PNG" "$ROOT_DIR/ICON_256.PNG" "$STAGE_DIR/"
cp -a "$ROOT_DIR/cmd" "$ROOT_DIR/config" "$ROOT_DIR/wizard" "$STAGE_DIR/"

# Runtime app directories
[ -d "$ROOT_DIR/app/shares" ] && cp -a "$ROOT_DIR/app/shares" "$STAGE_DIR/app/"
[ -d "$ROOT_DIR/app/var" ] && cp -a "$ROOT_DIR/app/var" "$STAGE_DIR/app/"
[ -f "$ROOT_DIR/app/ui/config" ] && cp -a "$ROOT_DIR/app/ui/config" "$STAGE_DIR/app/ui/"
[ -d "$ROOT_DIR/app/ui/images" ] && cp -a "$ROOT_DIR/app/ui/images" "$STAGE_DIR/app/ui/"
[ -e "$ROOT_DIR/app/ui/svg.svg" ] && cp -a "$ROOT_DIR/app/ui/svg.svg" "$STAGE_DIR/app/ui/"

# Frontend: keep dist only
cp -a "$ROOT_DIR/app/ui/frontend/dist" "$STAGE_DIR/app/ui/frontend/"

# Server: keep runtime files, trim known non-runtime heavy dirs
rsync -a \
  --exclude "node_modules/.bin/" \
  --exclude "node_modules/typescript/" \
  --exclude "node_modules/mathjax/" \
  --exclude "node_modules/@mathjax/" \
  "$ROOT_DIR/app/server/" "$STAGE_DIR/app/server/"

log "building fpk from staged directory"
pushd "$STAGE_DIR" >/dev/null
fnpack build --directory "$STAGE_DIR"
popd >/dev/null

if [ ! -f "$STAGE_DIR/$OUTPUT_FPK" ]; then
  echo "build failed: $OUTPUT_FPK not found in stage dir" >&2
  exit 1
fi

cp -f "$STAGE_DIR/$OUTPUT_FPK" "$ROOT_DIR/$OUTPUT_FPK"
log "done: $ROOT_DIR/$OUTPUT_FPK ($(du -sh "$ROOT_DIR/$OUTPUT_FPK" | cut -f1))"
