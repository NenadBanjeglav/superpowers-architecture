@echo off
setlocal
where node.exe >nul 2>nul
if errorlevel 1 (
  >&2 echo Superpowers Architecture requires Node.js 20 or newer. Install Node.js, then retry this correctness-critical operation.
  exit /b 127
)
node.exe "%~dp0spa.mjs" %*
exit /b %errorlevel%
