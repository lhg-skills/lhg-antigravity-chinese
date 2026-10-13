#!/bin/bash
# lhg-antigravity-chinese macOS 一键汉化（入口脚本，位于仓库根目录）
# 引擎与词典源自 qqxpee/antigravity2-cn（见 THIRD-PARTY-NOTICES.md），本仓库做了兼容性预检与失败诊断增强。
cd "$(dirname "$0")"

# 补充 macOS 常见环境路径 (兼容 Intel 与 Apple Silicon M 系列芯片及各类包管理器)
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

# [兼容性预检] 平台/架构/版本判定，未通过则给出降级或终止建议
if ! node compat-check.js "$@"; then
    echo ""
    echo "预检未通过，已按上方提示处理。按任意键退出..."
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

# 确保在提权后也具备完整的 PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo ""
    echo "======================================================"
    echo " [错误] 未检测到 Node.js 环境，无法执行汉化。"
    echo " 请前往 https://nodejs.org 下载安装 Node.js (LTS 版本) 后重试。"
    echo "======================================================"
    echo ""
    echo "按任意键退出..."
    read -n 1 -s
    exit 1
fi

# 品牌显示方式（默认英文 Antigravity；命令行传 --brand-title 可覆盖）
BRAND_ARG="--brand-title english"
for arg in "$@"; do
    if [[ "$arg" == --brand-title* ]]; then
        BRAND_ARG=""
        break
    fi
done

if [ -n "$BRAND_ARG" ] && [ -t 0 ]; then
    echo "====== 正在安装 macOS 版 Antigravity 中文汉化 ======"
    echo "请选择左上角品牌显示方式："
    echo "[1] 显示英文 Antigravity（推荐）"
    echo "[2] 不显示品牌名"
    echo "[3] 显示中文品牌名"
    printf "请输入 1/2/3，直接回车默认 1："
    read -r BRAND_CHOICE
    if [ "$BRAND_CHOICE" = "2" ]; then
        BRAND_ARG="--brand-title hidden"
    elif [ "$BRAND_CHOICE" = "3" ]; then
        BRAND_ARG="--brand-title translated"
    fi
fi

# 若外部未指定 --install-dir 且默认路径存在，则提供默认路径；否则交由引擎探测
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

# 引擎输出落盘，供失败诊断使用
LOG="$(mktemp /tmp/lhg-antigravity-zh.XXXXXX.log)"
cd mac
node localization_engine.js $BRAND_ARG $INSTALL_DIR_ARG "$@" > "$LOG" 2>&1
RESULT=$?
cd ..
cat "$LOG"

if [ $RESULT -ne 0 ]; then
    echo ""
    # [失败诊断增强] EPERM 是 macOS 13+ "App 管理"权限限制的高频坑（实测踩过）
    if grep -q "EPERM" "$LOG" 2>/dev/null; then
        echo "[诊断] 检测到 EPERM 错误：这不是密码问题，是 macOS 13+ 的「App 管理」隐私权限限制。"
        echo "[诊断] 修复：系统设置 → 隐私与安全性 → App 管理 → 打开你正在用的终端 App 的开关"
        echo "[诊断]       （列表里没有就点 + 手动添加），然后重新运行本脚本即可。"
    else
        echo "运行失败！请检查上方错误信息。"
    fi
    echo "按任意键退出..."
    [ -t 0 ] && read -n 1 -s
    exit 1
fi

rm -f "$LOG"
echo ""
echo "处理完成。窗口将在 5 秒后自动关闭（或按任意键立即关闭）..."
[ -t 0 ] && read -t 5 -n 1 -s || true
exit 0
