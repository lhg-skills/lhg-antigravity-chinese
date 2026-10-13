@echo off
rem lhg-antigravity-chinese Windows 一键还原官方英文（huashuimoyv 引擎，MIT 协议）
chcp 65001 >nul
cd /d "%~dp0.."

rem [兼容性预检] 还原为低风险操作，用 --force 跳过交互
node compat-check.js --force
if errorlevel 1 (
    echo 预检未通过，请确认 Antigravity 安装位置。
    pause
    exit /b 1
)

cd windows
set "NODE_CMD=node"
if exist "%~dp0windows\bin\node.exe" set "NODE_CMD=%~dp0windows\bin\node.exe"
"%NODE_CMD%" cli.js restore
set "result=%errorlevel%"
cd ..
pause
exit /b %result%
