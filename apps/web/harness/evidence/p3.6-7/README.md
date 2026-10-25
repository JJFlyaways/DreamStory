# P3.6-7：业务适配门 B 证据

## 浏览器真实 API／假模型链路

使用临时 SQLite 书库和 `fake_primary` 模型档案，在浏览器加载同一份 `apps/web/dist`：

1. Harness workspace 显示 DreamStory 作品“雾港来信”。
2. 打开 Session 后显示第一章计划、运行历史和“Workspace Write”。
3. 在 Harness composer 输入 `/plan`、`/write`，分别启动 `plan_chapter`、`draft_chapter`，并通过 DreamStory SSE 返回运行状态。
4. 通过现有 DreamStory HTTP 命令保存完整草稿、提交不可变定稿并保存审稿记录。
5. 刷新并重新打开 Session，仍显示“本章已定稿”，说明 UI 从持久 API 状态恢复，而不是依赖页面内存。

结果：页面错误 `0`，HTTP 4xx/5xx `0`。

实际 API 结果摘要：

| 操作                | 结果                     |
| ------------------- | ------------------------ |
| `draft PUT`         | `201`，`draftRevision=1` |
| `finalization POST` | `201`，`bookRevision=7`  |
| `review POST`       | `201`                    |
| 刷新恢复            | `本章已定稿` 可见        |

截图：[定稿恢复后的 Harness 会话](finalized-session.png)

## Electron

- `pnpm --filter @dreamstory/desktop build`：通过。
- `electron . --no-sandbox --disable-gpu`：运行至 15 秒 smoke 超时，无启动异常；测试进程由 timeout 终止。
- Electron 通过 `apps/web/dist` 加载与浏览器相同的业务适配产物，API 请求由薄壳代理到本地 Fastify。

## 差异边界

允许差异只有 DreamStory 品牌、书籍／章节／运行文案、业务命令语义，以及必须的外层业务内容顺序。Harness 组件 DOM、CSS、字体、图标、焦点状态和动效仍来自固定模板；未把旧 DreamStory React 页面重新引入运行树。
