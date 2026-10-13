#!/usr/bin/env node
'use strict';
/**
 * lhg-antigravity-chinese 汉化冒烟测试
 * =====================================
 * 汉化安装完成后、向用户宣布"完成"之前必须运行。四项检查，全过才算通过：
 *   1. 补丁在位：汉化引擎的备份产物存在（说明补丁确实打上了，且可还原）
 *   2. 客户端启动：能拉起 Antigravity 主进程（未运行则自动启动一次）
 *   3. 启动稳定：观察窗口内主进程 PID 不变（排除秒退、崩溃重启）
 *   4. 无崩溃报告：观察窗口内系统未生成新的 Antigravity 崩溃转储
 *
 * 用法：node smoke-test.js
 * 退出码：0 = 全部通过；1 = 存在失败项（输出里会逐条标注）
 * 本脚本只读检测 + 允许拉起客户端一次，不修改任何文件，全程不联网。
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const START_TIME = Date.now();
const LAUNCH_WAIT_MS = 15000;   // 启动后等待
const STABLE_WAIT_MS = 10000;   // 稳定观察窗口

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? '通过' : '失败'}] ${name}${detail ? ' —— ' + detail : ''}`);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function pgrepAntigravity() {
  try {
    if (process.platform === 'darwin') {
      return execFileSync('pgrep', ['-x', 'Antigravity'], { encoding: 'utf8' }).trim();
    }
    if (process.platform === 'win32') {
      const out = execFileSync('tasklist', ['/FI', 'IMAGENAME eq Antigravity.exe', '/FO', 'CSV', '/NH'], { encoding: 'utf8' });
      const m = out.match(/"Antigravity\.exe","(\d+)"/);
      return m ? m[1] : '';
    }
  } catch { /* 无进程 */ }
  return '';
}

function launchAntigravity() {
  try {
    if (process.platform === 'darwin') {
      execFileSync('open', ['-a', 'Antigravity']);
      return true;
    }
    if (process.platform === 'win32') {
      const exe = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'antigravity', 'Antigravity.exe');
      if (!fs.existsSync(exe)) return false;
      execFileSync('cmd', ['/c', 'start', '""', exe], { shell: false, windowsVerbatimArguments: true });
      return true;
    }
  } catch { return false; }
  return false;
}

function listNewCrashReports() {
  const dirs = [];
  if (process.platform === 'darwin') {
    dirs.push(path.join(os.homedir(), 'Library', 'Logs', 'DiagnosticReports'));
  } else if (process.platform === 'win32') {
    dirs.push(path.join(process.env.LOCALAPPDATA || '', 'CrashDumps'));
  }
  const hits = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/^Antigravity/i.test(f)) continue;
      if (!/\.(ips|dmp)$/i.test(f)) continue;
      try {
        const st = fs.statSync(path.join(dir, f));
        if (st.mtimeMs > START_TIME - 60000) hits.push(path.join(dir, f)); // 60 秒宽限
      } catch { /* 忽略 */ }
    }
  }
  return hits;
}

function patchMarkers() {
  // 返回 {found, detail}：汉化引擎的备份产物是否在位
  if (process.platform === 'darwin') {
    const resources = ['/Applications/Antigravity.app/Contents/Resources',
      path.join(os.homedir(), 'Applications', 'Antigravity.app/Contents/Resources')];
    for (const r of resources) {
      const bak = path.join(r, 'app.asar.bak');
      if (fs.existsSync(bak)) return { found: true, detail: bak };
    }
    return { found: false, detail: '未找到 app.asar.bak（检查过 ' + resources.join('、') + '）' };
  }
  if (process.platform === 'win32') {
    const dir = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'antigravity', 'resources', '.antigravity-local-zh');
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const n = fs.readdirSync(dir).length;
      return { found: n > 0, detail: dir + `（${n} 个文件）` };
    }
    return { found: false, detail: '未找到备份目录 ' + dir };
  }
  return { found: false, detail: '不支持的平台' };
}

(async () => {
  console.log('==================== 汉化冒烟测试 ====================');

  // 1. 补丁在位
  const marker = patchMarkers();
  record('1. 汉化补丁在位（备份可还原）', marker.found, marker.found ? marker.detail : marker.detail + ' —— 可能未成功安装或已还原');

  // 2. 客户端启动（未运行则拉起一次）
  let pids = pgrepAntigravity();
  let launched = false;
  if (!pids) {
    console.log('[信息] Antigravity 未运行，自动启动一次……');
    launched = launchAntigravity();
    if (!launched) {
      record('2. 客户端启动', false, '无法自动启动（未找到 App 或 open/start 失败），请手动打开后重跑');
      finish();
      return;
    }
    await sleep(LAUNCH_WAIT_MS);
    pids = pgrepAntigravity();
  }
  record('2. 客户端启动', !!pids, pids ? `主进程 PID: ${pids.split('\n').join(', ')}` : `${Math.round(LAUNCH_WAIT_MS / 1000)}s 内未检测到主进程，疑似启动失败`);

  // 3. 稳定性观察
  if (pids) {
    await sleep(STABLE_WAIT_MS);
    const pidsAfter = pgrepAntigravity();
    record('3. 启动稳定（PID 未变）', !!pidsAfter && pidsAfter === pids,
      pidsAfter === pids ? `观察 ${Math.round(STABLE_WAIT_MS / 1000)}s 进程稳定` : `启动前后 PID 不一致（${pids.replace('\n', ',')} → ${pidsAfter || '无'}），疑似崩溃重启`);
  } else {
    record('3. 启动稳定（PID 未变）', false, '前置的启动检查未通过');
  }

  // 4. 无新崩溃报告
  const crashes = listNewCrashReports();
  record('4. 无新崩溃报告', crashes.length === 0, crashes.length ? crashes.join('; ') : '观察窗口内无新生成崩溃转储');

  finish();
})();

function finish() {
  const failed = results.filter(r => !r.pass);
  console.log('======================================================');
  if (failed.length === 0) {
    console.log(`冒烟测试：全部通过（${results.length}/${results.length}）。`);
    console.log('注意：界面文案是否已中文化属 UI 层验证，由宿主 agent 截屏确认或请用户亲自看一眼后确认。');
  } else {
    console.log(`冒烟测试：未通过（${results.length - failed.length}/${results.length}）。`);
    console.log('按 SKILL.md 规定：禁止向用户宣称汉化完成；请先执行还原（mac 双击卸载还原 / win node cli.js restore），再向用户如实汇报。');
  }
  process.exit(failed.length === 0 ? 0 : 1);
}
