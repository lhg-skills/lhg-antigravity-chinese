# THIRD-PARTY-NOTICES — 第三方组件引用声明

本仓库（lhg-antigravity-chinese）在自身 SOP 与兼容性层之外，收录了两个第三方汉化引擎。引用情况如下，全部显著署名、引擎本体未做修改：

## 1. windows/ 目录 — huashuimoyv/antigravity-chinese

- **来源**：https://github.com/huashuimoyv/antigravity-chinese
- **收录内容**：`cli.js`、`src/`（asar.js / patcher.js / runtime.js / menu.js）、`dict/zh-CN.json`
- **许可证**：**MIT License**（上游 LICENSE 原文如下，依其条款自由使用、修改与再分发）
- **本仓库改动**：仅在 `cli.js` 文件头追加来源署名注释；引擎本体零修改。

```
MIT License

Copyright (c) 2026 huashuimoyv

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 2. mac/ 目录 — qqxpee/antigravity2-cn

- **来源**：https://github.com/qqxpee/antigravity2-cn
- **收录内容**：`localization_engine.js`、`dicts/*.json`（7 个简体中文词典）
- **许可证状态**：截至本仓库收录时（2026-10-13），**上游仓库未附 LICENSE 文件**。按默认版权规则，其权利归上游作者所有。
- **本仓库收录依据与承诺**：
  1. 上游仓库以公开仓库形式发布且 README 明确提供一键安装/克隆使用方式，本仓库按"为兼容性整合与教学目的引用"收录，并在文件头与本声明中**显著署名来源**；
  2. 引擎与词典**原样收录、零修改**，本仓库新增的兼容性预检、失败诊断均在外层脚本，不触碰引擎本体；
  3. 本仓库不将上游内容用于商业销售，仅随开源 skill 免费分发；
  4. **如上游作者提出异议，承诺立即移除 mac/ 目录全部内容**，并改由 SOP 指导用户直接从上游仓库获取；
  5. 欢迎上游作者随时开 issue 沟通署名方式或许可事宜。

## 3. 与 Google / Electron 的关系

本仓库与 Google（Antigravity 官方）、Electron、以及两个上游项目均无隶属关系。Antigravity 商标归其权利人所有。本仓库仅为社区汉化整合工具。

## 4. 安全说明

两个引擎均经代码审查：全程离线、无混淆、无网络请求；以非破坏性方式修改 `app.asar`（原数据区不动，追加翻译资源），自动备份且可一键还原。详见各引擎源文件。
