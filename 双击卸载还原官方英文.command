#!/bin/bash
# lhg-antigravity-chinese macOS 一键还原官方英文（入口脚本，位于仓库根目录）
# 基于 qqxpee/antigravity2-cn 还原流程（见 THIRD-PARTY-NOTICES.md），增加兼容性预检。
cd "$(dirname "$0")"

export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

# [兼容性预检] 确认平台与客户端位置（还原是低风险操作，版本风险提示不影响放行）
if ! node compat-check.js --force; then
    echo ""
    echo "预检未通过。若 Antigravity.app 已被移动或删除，请确认位置后用 --install-dir 指定。按任意键退出..."
    [ -t 0 ] && read -n 1 -s
    exit 1
fi

# 检查管理员权限，若不是 root 则自动通过 sudo 提权并保留环境变量
if [ "$EUID" -ne 0 ]; then
    echo "======================================================"
    echo " 提示：macOS 系统修改应用程序（/Applications）需要管理员权限"
    echo " 请在下方输入您的电脑开机密码（输入时密码不显示，直接回车）："
    echo "======================================================"
    exec sudo env "PATH=$PATH" "HTTP_PROXY=$HTTP_PROXY" "HTTPS_PROXY=$HTTPS_PROXY" "ALL_PROXY=$ALL_PROXY" "http_proxy=$http_proxy" "https_proxy=$https_proxy" "all_proxy=$all_proxy" "SUDO_USER=$USER" bash "$0" "$@"
fi

export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

if ! command -v node &> /dev/null; then
    echo ""
    echo "[错误] 未检测到 Node.js 环境，无法执行还原。请安装 Node.js (LTS) 后重试。"
    echo ""
    echo "按任意键退出..."
    read -n 1 -s
    exit 1
fi

INSTALL_DIR_ARG=""
HAS_CUSTOM_INSTALL_DIR=false
for arg in "$@"; do
    if [[ "$arg" == --install-dir* ]]; then
        HAS_CUSTOM_INSTALL_DIR=true
        break
    fi
done

if [ "$HAS_CUSTOM_INSTALL_DIR" = false ] && [ -d "/Applications/Antigravity.app" ]; then
    INSTALL_DIR_ARG="--install-dir /Applications/Antigravity.app"
fi

LOG="$(mktemp /tmp/lhg-antigravity-restore.XXXXXX.log)"
echo "====== 正在还原 macOS 版 Antigravity 官方英文 ======"
cd mac
node localization_engine.js --huifu $INSTALL_DIR_ARG "$@" > "$LOG" 2>&1
RESULT=$?
cd ..
cat "$LOG"

if [ $RESULT -ne 0 ]; then
    echo ""
    if grep -q "EPERM" "$LOG" 2>/dev/null; then
        echo "[诊断] 检测到 EPERM 错误：macOS 13+ 的「App 管理」隐私权限限制。"
        echo "[诊断] 修复：系统设置 → 隐私与安全性 → App 管理 → 打开你正在用的终端 App 的开关后重试。"
    else
        echo "运行失败！请检查上方错误信息。"
    fi
    echo "按任意键退出..."
    [ -t 0 ] && read -n 1 -s
    exit 1
fi

rm -f "$LOG"
echo ""
echo "还原完成，界面已恢复官方英文。窗口将在 5 秒后自动关闭（或按任意键立即关闭）..."
[ -t 0 ] && read -t 5 -n 1 -s || true
exit 0
