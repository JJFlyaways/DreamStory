<div align="center">
  <img src="branding/final/digital/dreamstory-symbol-color-512.png" width="100" height="100" alt="DreamStory Logo">
  <h1>DreamStory</h1>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/status-experimental-orange" alt="Experimental">
  <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111" alt="React">
  <img src="https://img.shields.io/badge/SQLite-local--first-003B57?logo=sqlite&logoColor=white" alt="SQLite">
</p>

---

## 简介

DreamStory 是一个本地优先的 AI 小说创作工作台，帮助作者完成作品规划、角色与世界设定、章节写作、版本回看和长期连续性维护。

它把规划、设定、正文和版本放在同一本书里。当前即使没有接入模型，也可以从第一句话开始写作；模型能力通过独立的 gateway 边界逐步接入。

## 当前能力

- 作品书库：创建、切换和更新小说作品。
- 故事规划：支持故事核心、卷、故事弧和章节层级。
- 设定管理：保存角色、世界观和创作约定。
- 章节写作：基于 Markdown 编辑器编写正文。
- 版本历史：保存草稿版本、只读预览并恢复历史版本。
- 本地存储：每本书使用独立的 SQLite 数据库，启用 WAL，并在迁移前创建备份。
- 导出与备份：导出 Markdown/TXT，并创建一致性 SQLite 备份。
- 本地 API：Fastify 服务默认只监听 `127.0.0.1`，前端通过 Vite 代理访问 API。

## Quickstart

### 环境要求

- Node.js
- pnpm 12（仓库通过 `packageManager` 固定为 `pnpm@12.14.0`）

安装依赖：

```bash
corepack enable
pnpm install
```

启动 API 服务：

```bash
pnpm --filter @dreamstory/server start
```

API 默认监听 `http://127.0.0.1:3000`。

另开一个终端启动前端：

```bash
pnpm --filter @dreamstory/web dev
```

然后打开 <http://127.0.0.1:5173>。

健康检查：

```bash
curl http://127.0.0.1:3000/api/v1/health
```

## 常用命令

```bash
# 构建所有可构建的 workspace
pnpm build

# 格式、Lint 和 TypeScript 检查
pnpm check

# 运行各 workspace 的测试
pnpm test

# 只构建前端并启动 Vite preview
pnpm --filter @dreamstory/web start
```

如果使用 `web start`，API 服务仍需要单独运行。

## 数据位置

默认数据目录由操作系统决定：

- Linux：`~/.local/share/DreamStory/`
- macOS：`~/Library/Application Support/DreamStory/`
- Windows：`%APPDATA%/DreamStory/`

默认书库位于数据目录下的 `library/`。每本书使用如下结构：

```text
library/
└── book_<id>/
    ├── .dreamstory/story.sqlite
    ├── .dreamstory/backups/
    └── exports/
```

可通过环境变量覆盖默认配置：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DREAMSTORY_PORT` | `3000` | API 端口 |
| `DREAMSTORY_HOST` | `127.0.0.1` | 仅允许 loopback 主机 |
| `DREAMSTORY_LIBRARY_ROOT` | 数据目录下的 `library/` | 书库根目录 |
| `DREAMSTORY_LOG_PATH` | 数据目录下的 `logs/server.log` | 服务日志路径 |
| `DREAMSTORY_LOG_LEVEL` | `info` | `debug` / `info` / `warn` / `error` |
| `DREAMSTORY_ALLOWED_ORIGINS` | `3000`、`5173`、`4173` loopback 来源 | 允许的前端来源 |
| `DREAMSTORY_SESSION_TTL_SECONDS` | `3600` | 会话有效期 |
| `DREAMSTORY_MODEL_PROFILES` | 空数组 | 模型 profile JSON 配置 |

## 项目结构

```text
apps/
├── web/       # React + Vite 写作工作台
└── server/    # Fastify 本地 API、会话和项目管理

packages/
├── contracts/       # API、领域对象和配置契约
├── application/     # 作品、规划、写作和导出用例
├── storage-sqlite/  # SQLite schema、迁移、仓储和备份
├── model-gateway/   # 模型接入边界与 fake model 测试实现
├── domain/          # 领域层扩展点
├── story-context/   # 故事上下文扩展点
└── quality/         # 质量检查扩展点
```

## API 概览

API 以 `/api/v1` 为根路径，主要资源包括：

- `/health`：服务和数据库健康状态。
- `/session`：本地写请求所需的会话与 CSRF token。
- `/books`：作品书库和作品信息。
- `/books/:bookId/plans`：故事规划与规划历史。
- `/books/:bookId/chapters`：章节目录与章节内容。
- `/books/:bookId/chapters/:chapterId/drafts`：草稿版本与恢复。
- `/books/:bookId/exports`：Markdown/TXT 导出。
- `/books/:bookId/backups`：SQLite 备份。

## Logo 与品牌资源

已确定的“书封面 + 书页 + 小说引号”Logo 套件位于 [`branding/final/`](branding/final/)：

- [品牌规范](branding/final/brand-guidelines.md)
- [横向彩色 SVG](branding/final/source/dreamstory-logo-horizontal-color.svg)
- [App 图标](branding/final/digital/dreamstory-symbol-app-icon.svg)
- [favicon 与 PWA 图标](branding/final/digital/site.webmanifest)

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FJJFlyaways%2FDreamStory.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2FJJFlyaways%2FDreamStory?ref=badge_large&issueType=license)

项目当前处于早期开发阶段。正式发布前请补充仓库的许可证文件和贡献指南，并以 FOSSA 扫描结果为准确认依赖许可证信息。
