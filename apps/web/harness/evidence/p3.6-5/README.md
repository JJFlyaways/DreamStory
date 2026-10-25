# P3.6-5：作者操作与运行流证据

本步在已通过门 A 的 Harness 会话、输入和消息组件中接入 DreamStory 领域命令；没有新造输入框、消息卡片或运行面板。

已接入的命令边界：

- `/plan` → `plan_chapter`
- `/write` → `draft_chapter`
- `/review` → `review_chapter`
- `/revise` → `revise_chapter`
- `/context` → `POST /context/preview`
- `/finalize` → 当前完整草稿的定稿命令（无可定稿草稿时明确失败）
- `/export` → Markdown 导出命令

运行过程通过 DreamStory `GET /runs/:runId/events` SSE 读取，结果转换回 Harness Session history；运行失败、来源冲突和缺少模型档案都会以真实错误回到当前会话。Session follow 流由 adapter 推送新增事件，因此消息组件、运行状态和恢复点仍由 Harness 原有组件承载。

验证条件：

- 临时 DreamStory 服务使用 `fake_primary` 模型档案，避免付费模型调用。
- 真实作品：`雾港来信`，第一章计划 `plan_chapter_1`。
- 浏览器输入 `/plan` 后，服务端产生 `plan_chapter` 运行并进入 `awaiting_author`；页面显示用户消息、运行完成状态和 `Workspace Write` 权限状态。
- 页面错误：0；HTTP 4xx/5xx：0。

截图：[Harness 作者运行流](p3.6-5-author-run.png)

写命令仍由 DreamStory API 的 CSRF、`expectedBookRevision`、幂等请求 ID和来源校验保护；Harness 的消息展示不直接修改作品事实。
