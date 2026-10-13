# lhg-antigravity-chinese — Antigravity 反重力汉化助手

> Google Antigravity（反重力）桌面客户端 **Windows / macOS 双平台中文汉化** skill。
> 一键安装：`npx skills add lhg-skills/lhg-antigravity-chinese`
>
> 把上面这句话（或仓库链接）发给任意 Agent（WorkBuddy / Claude Code / Codex / Cursor 等），它就能按仓库里的 SOP 帮你完成汉化。

## 这是什么

Google Antigravity 官方没有中文界面。本仓库把两个优秀的开源汉化引擎整合成**一条双平台 SOP**，并补齐了它们都没做的**兼容性保障层**：

| 平台 | 引擎来源 | 状态 |
|---|---|---|
| Windows 10/11 | [huashuimoyv/antigravity-chinese](https://github.com/huashuimoyv/antigravity-chinese)（MIT） | ✅ 2.23.0 实测走通（2026-10-13） |
| macOS Apple Silicon | [qqxpee/antigravity2-cn](https://github.com/qqxpee/antigravity2-cn) | ✅ 2.23.0 实测走通（2026-10-13） |
| macOS Intel | 同上（引擎与架构无关） | ⚠️ 兼容分支，未实测，预检会要求确认 |
| 客户端 < 2.22.0 / 未知新版本 | — | ⚠️ 降级策略：风险告知 + 用户确认 |
| Linux | — | ❌ 如实终止，给上游手动方案 |

## 相比直接用上游项目，多了什么（兼容性优化）

1. **平台/架构预检分流**（`compat-check.js`）：装之前先判定系统、架构、客户端版本，Windows 和 Mac 各走各的引擎，不再需要用户自己看两份教程。
2. **Intel Mac 兼容分支**：上游只写明支持 Apple Silicon；本仓库明确"引擎与 CPU 架构无关"，Intel 用户预检通过（知情确认）即可继续。
3. **新版本降级策略**：客户端版本超出已验证范围（2.22.0+）时，不直接拒绝也不硬装——告知"词典可能覆盖不全、可随时还原"的风险，用户确认后降级继续。
4. **EPERM 自动诊断**：macOS 13+ 修改 /Applications 报 EPERM 是最高频的翻车点（实测踩过），入口脚本检测到后直接打印修复路径（系统设置 → 隐私与安全性 → App 管理），不用用户自己瞎猜。
5. **装完必过冒烟测试**（`smoke-test.js`）：补丁在位、客户端启动、10 秒进程稳定、无新崩溃报告，四项全过才许 agent 向用户报"完成"；任何一项失败，agent 必须先自动还原到官方英文再如实汇报。UI 层由 agent 截屏或用户亲眼确认收尾。
6. **Agent 友好**：预检支持 `--force` 非交互模式；SKILL.md 写死了"管理员密码必须用户亲手输、降级必须双确认、冒烟不过不许报完成"的人机分工铁律，任何 agent 按规范执行都不会越界。

## 快速开始（手动双击版）

前置：安装 [Node.js LTS](https://nodejs.org)；**保存工作并彻底退出 Antigravity**。

- **macOS**：双击 `双击安装中文汉化.command`（会要管理员密码）→ 重启 Antigravity 即中文。
- **Windows**：双击 `windows/一键汉化.cmd` → 重启 Antigravity 即中文。
- **还原官方英文**：macOS 双击 `双击卸载还原官方英文.command`；Windows 运行 `windows/一键还原英文.cmd` 或 `node windows/cli.js restore`。

> macOS 如报 EPERM：系统设置 → 隐私与安全性 → **App 管理** → 打开所用终端的开关，重跑即可（脚本也会自动提示）。

## 快速开始（Agent 代办版）

把这句话发给你的 Agent：

> 帮我安装并运行这个技能：https://github.com/lhg-skills/lhg-antigravity-chinese ，按里面的 SOP 把我的 Antigravity 汉化成中文。需要输管理员密码时停下来等我亲手输。

Agent 会按 `SKILL.md` 执行：环境自检 → 兼容性预检 → 你确认退出客户端 → 引擎安装 → 冒烟测试（启动/稳定/崩溃/补丁四项）→ UI 验证 → 全部通过才告诉你"完成"，失败会自动还原并如实汇报。

## 汉化范围与边界

- ✅ 界面菜单、设置面板、登录引导、加载页等（650+ 条文案）
- ❌ 代码编辑区、终端输出、AI 对话内容**刻意不翻译**（设计如此）
- AI 回复语言与界面汉化是两回事：聊天面板 `···` → Customizations → Rules → Global → GEMINI.md 写入"始终使用简体中文回复。"
- 官方自动更新会覆盖汉化 → 重跑安装命令即可，无需重新下载

## 安全说明

- 引擎全程离线，无网络请求、无混淆代码
- 非破坏性修改 `app.asar`：原数据区零改动，自动备份，可一键逐文件还原
- 引用声明与上游许可状态见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)（Windows 引擎 MIT；Mac 引擎已显著署名，上游提出异议即移除）
- 安装前可审阅全部源码

## 问题反馈

汉化失效 / 引擎报错 / 词典缺口：请开 [issue](https://github.com/lhg-skills/lhg-antigravity-chinese/issues/new)，附上系统版本、客户端版本和报错原文。

## 出品：刘洪光

本 skill 由真人出镜 IP「刘洪光」（安徽合肥）出品，归属 [lhg-skills](https://github.com/lhg-skills)。

- GitHub 主页：https://github.com/lhg-skills —— 全部 skill 开源在此，欢迎 star
- 视频号：搜「刘洪光实名上网」
- 微信：lhgsmsw
