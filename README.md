# 里程碑时间轴

用于飞书多维表格仪表盘的里程碑时间轴插件。节点名称与表格列名解耦，由用户手动填写名称和日期，统一发布后保存在当前仪表盘组件中。

## 功能

- 在一次配置中连续添加、删除多个里程碑节点。
- 按真实日期比例展示横向时间轴，并标记当天日期。
- 提供 16 种节点图标，支持预设色、自定义颜色和透明色。
- 支持插件背景、横轴颜色及 1–8px 横轴粗细设置。
- 节点悬停放大，窄组件紧凑布局，宽度不足时横向滚动。
- 配置保存在当前仪表盘组件中，不读取整列记录自动生成节点。

## 本地环境

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Node.js：`^20.19.0 || >=22.12.0`，推荐使用 Node.js 22 LTS

```bash
npm install
npm run dev
```

## 生成飞书静态部署产物

```bash
npm run build
npm run package:review
```

普通构建会直接生成：

```text
dist/
├── index.html
└── assets/
    ├── index-*.js
    └── index-*.css
```

`vite.config.ts` 在普通构建时使用 `base: './'`，确保 JS/CSS 通过相对路径加载。`package-plugin-review.mjs` 会检查入口文件、应用根节点、资源相对路径以及引用文件是否真实存在。

## GitHub 需要提交的内容

请提交完整源码和最新 `dist` 目录，主要包括：

```text
src/
public/
index.html
package.json
package-lock.json
vite.config.ts
tsconfig*.json
eslint.config.mjs
components.json
package-plugin-review.mjs
dist/
```

`node_modules/`、本地环境文件、日志和 ZIP 文件已被 `.gitignore` 排除。**`dist/` 不允许忽略或删除**，因为飞书开发者中心会直接部署该目录。

每次修改源码后，都应重新执行 `npm run build` 和 `npm run package:review`，再把更新后的源码及 `dist/` 一起提交到 GitHub，避免审核代码与线上功能不一致。

## 飞书开发者中心配置

`package.json` 已声明：

```json
{
  "output": "dist"
}
```

根据平台开发指南，声明 `output` 后可跳过平台打包过程，直接上传指定目录。因此平台无需在 Node.js 16.19.0 中运行当前 Vite 8 构建；本地生成 `dist` 时仍须使用上述受支持的 Node.js 版本。

提交时请注意：

1. 商品类型选择“插件”，插件类型选择“仪表盘插件”。
2. GitHub 仓库应设为 Public；使用私有仓库时，按开发者中心页面提示为 `bitable-open@bytedance.com` 开通访问权限。
3. 仓库默认分支中必须包含最新 `dist/index.html` 和 `dist/assets/`。
4. 图标、封面、详情页介绍图、帮助文档、用户协议、隐私协议及联系方式按当前表单要求填写。

平台开发指南：<https://feishu.feishu.cn/docx/Ddacd0miwoNAHax8WGVctD0znOg>

## 保留的托管构建方式

当构建环境注入 `MIAODA_CLIENT_BASE_PATH` 或 `MIAODA_RESOURCE_CDN_PREFIX` 时，Vite 会继续使用原托管构建逻辑，生成 `dist/output/` 和 `dist/output_resource/`。未注入这些变量的普通构建始终生成飞书审核需要的相对路径静态包。

## 公开市场上架前仍需检查

本仓库结构解决 GitHub 提交和静态部署问题，不代表已通过全部市场上架审核。公开发布前仍需按平台规则补齐中、英、日国际化，检查全屏及深色模式兼容，并完成详情页素材和发布权限配置。
