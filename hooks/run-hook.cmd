: << 'CMDBLOCK'
@echo off
setlocal

if "%~1"=="" (
  >&2 echo run-hook.cmd: missing script name
  exit /b 1
)

set "HOST="
if /I "%~1"=="session-start-codex" set "HOST=codex"
if not defined HOST (
  >&2 echo run-hook.cmd: unsupported hook script %~1
  exit /b 2
)

set "HOOK_DIR=%~dp0"
for %%I in ("%HOOK_DIR%..") do set "PLUGIN_ROOT=%%~fI"

where node.exe >nul 2>nul
if errorlevel 1 (
  echo {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Superpowers Architecture degraded mode: Node.js is unavailable. Manually load and follow using-superpowers before any action. Correctness-critical helpers and phase handoffs must stop until Node.js is installed."}}
  exit /b 0
)

node.exe "%PLUGIN_ROOT%\skills\using-superpowers\scripts\spa.mjs" startup render --host "%HOST%" --plugin-root "%PLUGIN_ROOT%"
exit /b %errorlevel%
CMDBLOCK

set -euo pipefail
script_dir="$(cd "$(dirname "$0")" && pwd)"
script_name="${1:-}"
if [ -z "$script_name" ]; then
  echo "run-hook.cmd: missing script name" >&2
  exit 1
fi
shift
if [ "$script_name" != "session-start-codex" ]; then
  echo "run-hook.cmd: unsupported hook script $script_name" >&2
  exit 2
fi
exec bash "$script_dir/$script_name" "$@"
