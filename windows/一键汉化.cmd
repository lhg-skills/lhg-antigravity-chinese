@echo off
rem lhg-antigravity-chinese Windows 一键汉化（huashuimoyv 引擎，MIT 协议，见 THIRD-PARTY-NOTICES.md）
chcp 65001 >nul
cd /d "%~dp0.."

rem [兼容性预检] 平台/版本判定
node compat-check.js
if errorlevel 1 (
    echo 预检未通过，已按上方提示处理。
    pause
    exit /b 1
)

echo ====== 请先保存工作并彻底退出 Antigravity（含托盘），按任意键继续 ======
pause >nul

cd windows
set "NODE_CMD=node"
if exist "%~dp0windows\bin\node.exe" set "NODE_CMD=%~dp0windows\bin\node.exe"
"%NODE_CMD%" cli.js check
if errorlevel 1 (
    echo check 未通过，详见上方输出。
    pause
    exit /b 1
)
"%NODE_CMD%" cli.js install
set "result=%errorlevel%"
cd ..
pause
exit /b %result%
