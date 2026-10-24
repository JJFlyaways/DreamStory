# Harness 客户端参考基线

DreamStory P3.5 的前端视觉与交互基线固定为本地参考仓库：

- 仓库：`/home/endpca/story/deepseek-harness`
- 上游：`https://github.com/deepseek-ai/deepseek-harness.git`
- 提交：`22ddee3792402c3e70ec5f86a63c3e3e895a2f60`

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

| Harness 表面              | DreamStory 内容                  |
| ------------------------- | -------------------------------- |
| Workspace / Sidebar       | 书架、作品、卷弧、章节           |
| Conversation / Session    | Agent 运行、步骤和持久事件       |
| Tool trace                | 受许可工具和模型调用             |
| Composer / Commands       | 规划、写章、审稿、修订入口       |
| Right sidebar / Inspector | 来源、事实、实体、伏笔、审稿证据 |
| Deliverables              | 提案、正文候选、草稿、定稿       |

组件的外观、字体、主题和动效沿用固定提交；DreamStory 只改变业务内容、容器排布和领域命令。业务事实继续由 `application`、Fastify 和 SQLite 负责，Web UI 不直接写数据库。

## 许可边界

Harness 主仓库使用 MIT 许可证；移植源代码时必须保留版权与许可证文本。Montserrat 字体及其 `Montserrat-OFL.txt` 按随附的 SIL Open Font License 处理。DreamStory 使用自己的产品名称、Logo 和应用资源，不复制上游品牌标识或宣传素材。
