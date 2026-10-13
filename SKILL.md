---
name: "lhg_antigravity_chinese"
description: "Google Antigravity（反重力）桌面客户端 Windows/macOS 汉化 SOP：平台兼容性预检分流→版本降级判定→客户端退出确认→引擎安装（Win 走 huashuimoyv 引擎 / Mac 走 qqxpee 引擎）→启动验证→一键还原。含 Intel Mac 兼容分支、新版本降级策略与 macOS App 管理权限诊断，双平台实测走通。"
version: "1.0.0"
---

# Antigravity 反重力汉化助手

> 功能：把 Google Antigravity 桌面客户端的界面汉化成简体中文。Windows 与 macOS（Apple Silicon）均已实测走通（2026-10-13，客户端 2.23.0）；Intel Mac 走兼容分支（未实测，有降级确认）；新版本超出验证范围时走降级策略。全程可一键还原官方英文。

## 宿主能力需求（跑这个 skill 前先确认）

本 skill 是"终端执行型"SOP。宿主 agent 必须具备：

1. **终端/命令执行能力**：能运行 node、bash、cmd 命令并读取输出。
2. **用户交互能力**：能在"用户保存工作退出客户端"和"输入管理员密码"两个节点停下来等人。
3. **不需要**：API key、用户密码。**管理员密码永远由用户亲手输入，agent 不碰、不读、不转发。**
4. 环境要求：Node.js 18+（推荐 22.12+）；macOS 修改 /Applications 需要管理员密码（用户输）；Windows 需要 Node 在 PATH。

如果宿主没有终端能力 → 直接降级为"指导版"：把 Workflow 逐条转述给用户自己执行，并如实说明为什么没能代办。不许假装代办成功。

## 人机分工（铁律）

| agent 做 | 用户做 |
|---|---|
| 运行兼容性预检、判断平台/版本、给出分流结论 | 保存 Antigravity 里未保存的工作 |
| 准备好仓库、写好待执行命令、解释每步做什么 | 彻底退出 Antigravity（含托盘/后台进程） |
| 失败时读输出、给诊断结论和修复路径 | 亲输入管理员密码（macOS） |
| 安装后告诉用户如何验证、如何还原 | 重新打开 Antigravity 验证中文界面 |

## Purpose

解决"Antigravity 官方没有中文界面"的问题。上游两个开源汉化项目各自只服务单一平台、且对 Intel Mac 和新版本没有兜底。本 skill 把双平台流程统一成一条 SOP，并新增三层兼容性保障：**平台/架构分流预检 → 版本降级确认 → 失败自动诊断（含 macOS 13+ App 管理权限这个高频坑的修复指引）**。让任何 agent 拿到这条 skill，都能安全地帮用户完成汉化，且随时可还原。

## 兼容性矩阵（如实声明）

| 系统/版本 | 状态 | 说明 |
|---|---|---|
| Windows 10/11 + 2.23.0 | ✅ 实测走通（2026-10-13） | huashuimoyv 引擎（MIT） |
| macOS Apple Silicon + 2.23.0 | ✅ 实测走通（2026-10-13） | qqxpee 引擎，含重签名 |
| macOS Intel（x64） | ⚠️ 兼容分支，未实测 | 引擎与架构无关，预检会要求用户确认 |
| 客户端 < 2.22.0 或未知新版本 | ⚠️ 降级策略 | 预检告知风险，用户确认后继续或中止 |
| Linux | ❌ 终止 | 给上游手动方案链接 |

## Workflow

### 第 0 步：环境自检

1. 确认 Node：`node --version` ≥ 18 即可（建议 22.12+）。没有 → 先引导用户安装 Node.js LTS，装不上才降级指导版。
2. 确认本 skill 仓库在本地（能找到 `compat-check.js`）。没有 → `git clone https://github.com/lhg-skills/lhg-antigravity-chinese.git`（或让用户从 GitHub 下载 ZIP 解压）。
3. **确认用户已保存 Antigravity 里的工作**——明确问一句，得到确认才继续。安装过程会强制结束 Antigravity 进程。

### 第 1 步：兼容性预检（核心新增，永远先跑）

- **动作**：在本仓库根目录运行 `node compat-check.js`。
- **输出判定**：
  - `exit 0` + "放行" → 按平台进第 2 步。
  - Windows 上直接放行 → 进第 2A 步（windows 引擎自己的 check 还会做一次版本与文件校验）。
  - macOS Intel → 预检要求确认"未实测组合"，agent 先向用户转述风险，用户同意后加 `--force` 重跑。
  - 版本低于 2.22.0 / 版本未知 → 预检会给出风险说明（词典可能覆盖不全、极端情况界面异常）和还原兜底提示，用户确认后 `--force` 继续，或中止去升级客户端。
  - Linux → 如实终止，给上游链接，不硬来。
- **红线**：预检退出码非 0 且用户没同意降级 → 停，不做任何修改。

### 第 2A 步（Windows）：安装

1. 引导用户彻底退出 Antigravity（关闭窗口 + 托盘区 + 任务管理器确认无 `Antigravity.exe`）。
2. 在仓库根目录运行 `node windows/cli.js check`——输出 `"supported": true` 才继续；`false` 说明版本不在支持范围，停，让用户看上游 README。
3. 运行 `node windows/cli.js install`。成功标志：输出 `"已安装本地汉化补丁"`。原版文件自动备份到安装目录 `resources\.antigravity-local-zh\`。
4. 或者直接双击 `windows/一键汉化.cmd`（已内置预检）。

### 第 2B 步（macOS）：安装

1. 引导用户彻底退出 Antigravity。
2. **macOS 13+ 高频坑提前告知**：修改 /Applications 需要"App 管理"权限。如果运行时报 EPERM，修复路径是：系统设置 → 隐私与安全性 → App 管理 → 打开所用终端的开关（列表没有就 + 手动添加）→ 重跑。本 skill 的入口脚本检测到 EPERM 会自动打印这段诊断。
3. 让用户在**用户自己的终端**里运行（密码必须用户亲手输）：
   ```bash
   bash <仓库路径>/双击安装中文汉化.command
   ```
   品牌显示选项回车选默认（显示英文 Antigravity）。
4. 脚本流程：预检 → sudo 提权 → 引擎打补丁 → 自动重签名。输出"处理完成"即成功。

### 第 3 步：验证

1. 用户重新打开 Antigravity，检查菜单、设置面板是否变中文。
2. 代码编辑区、终端输出、AI 对话内容**刻意不翻译**，属正常设计。
3. 想让 AI 用中文回复（与界面汉化是两回事）：聊天面板右上角 `···` → Customizations → Rules → Global → 在 GEMINI.md 写入"始终使用简体中文回复。"，新开 Chat 验证。

### 第 4 步：还原（随时可回退）

- macOS：`bash <仓库路径>/双击卸载还原官方英文.command`
- Windows：`node windows/cli.js restore`（或 `windows/一键还原英文.cmd`）
- 官方自动更新覆盖 asar 后汉化失效 → 重新跑一遍安装即可，无需重新克隆。

## Output Contract

每次执行完输出（中文）：

```
## 兼容性判定
- 系统：{Windows 10/11 / macOS arm64 / macOS x64 / 其他}，客户端版本 {x.y.z}
- 预检结论：{直接放行 / 用户确认降级继续 / 已中止（原因）}

## 安装结果
- 引擎：{huashuimoyv (Win) / qqxpee (Mac)}
- 结果：{已安装 / 已还原 / 失败（附关键报错原文）}
- 备份位置：{引擎输出的备份路径}

## 验证
- {用户反馈界面已中文化 / 用户未反馈，写"待用户验证"}

## 未核验项
- {如 Intel Mac 实测、新版本覆盖度等，如实写"未核验"}
```

## Operating Rules

1. **密码三不碰**：不替用户输管理员密码，不读用户剪贴板里的密码，不把密码写进任何命令或文件。
2. **预检前置**：任何安装/还原动作前必须先跑 `compat-check.js`。跳过预检直接动引擎 = 违规。
3. **降级双确认**：版本不符/Intel Mac 场景，必须把风险原文转述给用户、拿到明确同意（"继续"/"降级装"）才能 `--force`。含糊回答一律追问。
4. **失败即停**：引擎报错时不盲目重试。先读输出：EPERM → 走 App 管理权限诊断；版本不支持 → restore 并升级客户端；其他错误 → 原样记录报错，向用户提供还原命令兜底。
5. **只动 Antigravity**：不修改系统其他设置，不删除任何文件；所有写操作由引擎自身完成（引擎带备份与校验）。
6. **如实标注**：Intel Mac、新版本等未实测项，Output Contract 里写"未核验"，不许声称实测过。

## 自我质检与反馈（自迭代协议 v1.0）

宿主 agent 每次执行本 skill，先跑一遍质检：

1. 质检清单：预检是否先于一切写操作？密码是否全程用户自输？降级是否拿到用户明确确认？失败是否给了诊断而非盲目重试？未实测项是否如实标注？
2. 发现 skill 自身问题（客户端改版导致汉化失效、引擎报新错误、词典覆盖缺口）→ 先重试 1 次排除临时波动 → 生成《问题报告》（标题/现象/报错原文/系统与客户端版本/复现步骤/修复建议）→ 询问使用者"是否一键通知作者？" → 确认后二选一：
   - 有 gh CLI 且已登录：`gh issue create --repo lhg-skills/lhg-antigravity-chinese --title "{问题简述}" --body "{问题报告全文}"`
   - 否则输出预填链接：`https://github.com/lhg-skills/lhg-antigravity-chinese/issues/new?title={问题简述}&body={问题报告}`
3. 使用者侧只提 issue，不直接改原仓库。

## 未覆盖声明

- macOS Intel（x64）组合未实测（预检走兼容分支，需用户确认）。
- 客户端 2.24.0 及未来新版本的词典覆盖度未验证（预检走降级策略）。
- Linux 无自动化方案。
- 汉化只覆盖界面文案；代码编辑区、终端输出、AI 回复内容不翻译（设计如此）。
- 上游客户端改版可能导致引擎失效，以执行时的实测为准，失效请按质检协议提 issue。

## 分享即用（转发给朋友的一句话）

朋友想汉化 Antigravity 时，把下面这段话原样复制给他的 agent（WorkBuddy / Claude Code / Codex / Cursor 等均可）：

> 帮我安装并运行这个技能：https://github.com/lhg-skills/lhg-antigravity-chinese （可以先 `npx skills add lhg-skills/lhg-antigravity-chinese`，装不上就直接克隆仓库到你的技能目录），然后按技能里的 SOP 把我电脑上的 Google Antigravity 界面汉化成中文。我保存好工作退出客户端之后，你先跑兼容性预检再装；需要输管理员密码时停下来等我亲手输。装完告诉我怎么验证和还原。

边界说明（转告朋友时一并知道）：

1. **平台兼容**：Windows 10/11 与 macOS（Apple Silicon 实测、Intel 走兼容分支）。没有终端能力的纯对话 agent 会降级为指导版。
2. **两处必须本人操作**：保存退出客户端、输入管理员密码。agent 不碰密码——这条是底线。
3. **安全声明**：汉化引擎全程离线、不改核心二进制、自动备份可逐文件还原。收录的两个上游引擎一个 MIT 协议、一个已显著署名（见 THIRD-PARTY-NOTICES.md），安装前可审阅全文。
4. **前提**：已安装 Antigravity 桌面客户端 2.22.0+（低于此版本走降级确认）。

## 出品：刘洪光

本 skill 由真人出镜 IP「刘洪光」（安徽合肥）出品，归属 [lhg-skills](https://github.com/lhg-skills)。

- GitHub 主页：https://github.com/lhg-skills —— 全部 skill 开源在此，欢迎 star
- 视频号：搜「刘洪光实名上网」
- 微信：lhgsmsw
