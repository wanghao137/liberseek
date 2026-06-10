# 鳞卷工坊

鳞卷工坊是一个本地优先的龙鳞装/旋风装艺术创作工具。项目目标是把传统龙鳞装制作中的尺寸计算、叶片错位、长卷预览和打印导出流程做成可视化编辑器。

当前版本是第一阶段工程基线，已经包含：

- `Vite + React + TypeScript` 前端工程。
- 龙鳞装几何计算模块。
- 默认工艺参数测试。
- 派生尺寸、叶片排布、像素换算、校验信息的单元测试。
- 第一版中文三栏编辑器界面。

## 开发命令

安装依赖：

```sh
npm install
```

启动本地开发服务：

```sh
npm run dev
```

运行验证：

```sh
npm test
npm run lint
npm run build
```

## 项目文档

- `AGENTS.md`：项目级 agent 工作规则。
- `docs/product-plan.md`：中文产品计划和阶段路线。
- `docs/dayu-feature-map.md`：Dayu 功能对照与本项目优先级。
- `docs/craft-spec.md`：龙鳞装工艺术语、尺寸公式和校验规则。
- `docs/export-spec.md`：项目包、图片包、PDF、README 和 manifest 导出契约。

## 当前实现

核心几何模块位于 `src/modules/binding/geometry.ts`。它独立于 React 组件，供编辑器、预览和导出路径复用。

默认参数位于 `src/modules/binding/presets.ts`：

- 画心高度：`30cm`
- 页面可视宽度：`22cm`
- 粘贴宽度：`2cm`
- 鳞片露出宽度：`2cm`
- 叶片数量：`23`
- 导出 DPI：`300`

## 产品边界

MVP 聚焦本地创作和打印导出，不包含登录、支付、订单、云端项目、模板市场和打印服务后台。Dayu 仅作为公开功能参考，本项目不复制其代码、品牌、密钥、付费流程或商业实现。
