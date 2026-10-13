#!/usr/bin/env node
'use strict';
/**
 * lhg-antigravity-chinese 兼容性预检
 * =====================================
 * 在执行任何汉化/还原操作前运行，做三件事：
 *   1. 平台分流：Windows -> windows/（huashuimoyv 引擎）；macOS -> mac/（qqxpee 引擎优化版）；
 *      Linux 及其他系统 -> 如实终止并给出手动方案。
 *   2. 架构适配：macOS Apple Silicon（arm64）已实测；Intel（x64）走兼容分支，
 *      引擎本身与 CPU 架构无关，但需用户知情确认（截至发版未实测）。
 *   3. 版本降级：客户端版本超出已验证范围（< 2.22.0 或未知）时，告知风险，
 *      由用户决定"降级继续（可能部分界面仍是英文）"或"中止"。
 *
 * 用法：
 *   node compat-check.js [--force]
 *     --force  跳过交互确认（宿主 agent 已获得用户明确同意后使用）
 *
 * 退出码：0 = 放行继续；1 = 用户中止或检查未通过；2 = 平台不支持
 * 本脚本只读检测，不修改任何文件，全程不联网。
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const FORCE = process.argv.includes('--force');

// 已实测/已验证的客户端版本（qqxpee 词典匹配 2.22.0+，mac 2.23.0 与 win 2.23.0 均实测走通）
const KNOWN_MIN = [2, 22, 0];
const TESTED = ['2.23.0'];

function semverAtLeast(v, min) {
  const a = String(v).split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) > min[i]) return true;
    if ((a[i] || 0) < min[i]) return false;
  }
  return true;
}

function ask(question) {
  if (FORCE) return true;
  if (!process.stdin.isTTY) {
    console.error('[预检] 存在需人工确认的兼容性风险，但当前不是交互终端。');
    console.error('[预检] 宿主 agent 请先向用户说明风险并取得明确同意后，加 --force 重新运行。');
    process.exit(1);
  }
  process.stdout.write(question + ' [y/N] ');
  const buf = Buffer.alloc(1);
  try {
    const n = require('fs').readSync(0, buf, 0, 1);
    return n === 1 && (String(buf).trim().toLowerCase() === 'y');
  } catch { return false; }
}

function macAppPath() {
  const candidates = [
    '/Applications/Antigravity.app',
    path.join(os.homedir(), 'Applications', 'Antigravity.app')
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function macVersion(appPath) {
  try {
    const out = execFileSync('defaults', ['read', path.join(appPath, 'Contents', 'Info.plist'), 'CFBundleShortVersionString'], { encoding: 'utf8' });
    return out.trim();
  } catch { return null; }
}

function reportRoute(platform, arch, extra) {
  console.log('==================== 兼容性预检 ====================');
  console.log(`系统: ${platform} (${arch})`);
  if (extra) console.log(extra);
  console.log('====================================================');
}

const platform = process.platform;
const arch = process.arch;

if (platform === 'darwin') {
  const appPath = macAppPath();
  if (!appPath) {
    console.error('[预检] 未找到 Antigravity.app（已检查 /Applications 与 ~/Applications）。');
    console.error('[预检] 若安装在自定义位置，请按 SKILL.md 的 --install-dir 说明手动指定。');
    process.exit(1);
  }
  const version = macVersion(appPath) || '未知';
  let routeNote = `客户端: ${version}   安装位置: ${appPath}`;
  if (arch === 'arm64') {
    routeNote += `\n架构适配: Apple Silicon 已实测走通（${TESTED.join('、')}）`;
  } else if (arch === 'x64') {
    routeNote += `\n架构适配: Intel Mac 兼容分支 —— 汉化引擎与 CPU 架构无关（asar 注入 + 自签名流程相同），但此组合未实测。`;
  } else {
    console.error(`[预检] 未知架构 ${arch}，无适配方案，终止。`);
    process.exit(2);
  }
  reportRoute(platform, arch, routeNote);

  // 版本降级判定
  if (version === '未知' || !semverAtLeast(version, KNOWN_MIN)) {
    console.warn(`[预检] 客户端版本 ${version} 低于或无法确认是否达到已验证下限（${KNOWN_MIN.join('.')}）。`);
    console.warn('[预检] 风险：词典可能覆盖不全（部分界面保持英文），极端情况下界面显示异常。');
    console.warn('[预检] 兜底：可随时用「双击卸载还原官方英文.command」逐文件还原官方原版。');
    if (!ask('[预检] 是否仍要继续安装？')) {
      console.log('[预检] 已中止，未做任何修改。建议先升级 Antigravity 至 2.22.0+ 再汉化。');
      process.exit(1);
    }
    console.log('[预检] 用户已确认降级继续。');
  } else {
    console.log(`[预检] 版本检查通过。`);
  }

  if (arch === 'x64' && !ask('[预检] Intel Mac 为未实测组合，是否继续？')) {
    console.log('[预检] 已中止。欢迎之后到仓库 issue 区反馈 Intel 实测结果。');
    process.exit(1);
  }
  console.log('[预检] 放行：请按 SKILL.md 继续 macOS 安装流程。');
  process.exit(0);
}

if (platform === 'win32') {
  reportRoute(platform, arch, '架构适配: Windows x64 已实测走通（2.23.0，huashuimoyv 引擎）');
  console.log('[预检] 放行：请继续运行 windows/ 目录下的 cli.js check 做版本与文件校验。');
  process.exit(0);
}

console.error(`[预检] 平台 ${platform} 暂无自动化汉化方案（当前兼容：Windows、macOS Intel/Apple Silicon）。`);
console.error('[预检] 可参照上游项目 https://github.com/qqxpee/antigravity2-cn 的 Linux 指引手动操作，');
console.error('[预检] 或到 https://github.com/lhg-skills/lhg-antigravity-chinese/issues 提需求。');
process.exit(2);
