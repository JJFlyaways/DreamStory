# Harness 客户端实现基线

DreamStory P3.6 使用固定提交构建出的 Harness Web 运行时作为唯一前端模板。门 A 证据和业务适配证据位于 `apps/web/harness/evidence/`；本地参考仓库只用于重建和核验，不是运行时依赖：

- 仓库：`/home/endpca/story/deepseek-harness`
- 上游：`https://github.com/deepseek-ai/deepseek-harness.git`
- 提交：`22ddee3792402c3e70ec5f86a63c3e3e895a2f60`

正式构建产物由 `apps/web/harness/runtime/` 提供，`apps/web/harness/build.mjs` 将它复制到 `apps/web/dist/`。浏览器与 Electron 都加载这同一份 `dist`；旧 `apps/web/src` 页面不再参与构建。

## 参考入口

- 主题、字体、字号、圆角、焦点、滚动条和材料：`packages/client/ui-theme/src/styles/`
- 外层三栏框架：`packages/client/ui-layout/src/client/AppFrame.tsx` 与对应 CSS
- 左侧导航：`packages/client/ui-sidebar/src/client/`
- 右侧检查面板：`packages/client/ui-sidebar-right/src/client/`
- 消息与流式轨迹：`packages/client/ui-chat/src/client/`
- 工具轨迹：`packages/client/ui-tool/src/client/`
- 基础控件与行级动效：`packages/client/ui-primitives/src/`
- 写作输入与命令入口：`packages/client/ui-conversation/src/client/`、`packages/client/ui-commands/src/`
- 桌面壳：`apps/desktop/README.md` 与 `apps/desktop/src/`

## DreamStory 映射

| Harness 表面              | DreamStory 内容                                                             |
| ------------------------- | --------------------------------------------------------------------------- |
| Workspace / Sidebar       | 书架、作品、卷弧、章节                                                      |
| Conversation / Session    | Agent 运行、步骤和持久事件                                                  |
| Tool trace                | 受许可工具和模型调用                                                        |
| Composer / Commands       | `/plan`、`/write`、`/review`、`/revise`、`/context`、`/finalize`、`/export` |
| Right sidebar / Inspector | 来源、事实、实体、伏笔、审稿证据                                            |
| Deliverables              | 提案、正文候选、草稿、定稿                                                  |

组件的外观、字体、主题和动效沿用固定提交；DreamStory 只改变业务内容、容器排布和领域命令。业务事实继续由 `application`、Fastify 和 SQLite 负责，Web UI 不直接写数据库。适配器先提供只读状态，作者命令通过现有 API 的 CSRF、修订号、来源指纹和幂等约束提交。

## 许可边界

Harness 主仓库使用 MIT 许可证；移植源代码时必须保留版权与许可证文本。Montserrat 字体及其 `Montserrat-OFL.txt` 按随附的 SIL Open Font License 处理。DreamStory 使用自己的产品名称、Logo 和应用资源，不复制上游品牌标识或宣传素材。
