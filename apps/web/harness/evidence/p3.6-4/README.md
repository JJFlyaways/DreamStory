# P3.6-4：DreamStory 只读状态适配证据

本步只接入读取边界，继续使用 Harness 的 workspace、Session、projection、history 和 composer 外壳；没有新增可见业务组件，也没有接入作者写入命令。

| DreamStory                | Harness 只读表面                             |
| ------------------------- | -------------------------------------------- |
| 一本作品                  | 一个 workspace                               |
| 作品标题与更新时间        | workspace 标题与 Session 更新时间            |
| 作品                      | 一个只读 Session                             |
| 章节目录                  | Session projection 的 To-dos                 |
| 章计划目标                | Session history 中的用户消息摘要             |
| 草稿／定稿存在性          | assistant history 状态摘要                   |
| `bookRevision` 等持久事实 | adapter 内部缓存的来源，不由 UI 推断写入结果 |

验证条件：

- 固定 Harness 提交：`22ddee3792402c3e70ec5f86a63c3e3e895a2f60`
- DreamStory API：临时 `XDG_DATA_HOME`、loopback `3010`
- 夹具作品：`book_11111111-1111-4111-8111-111111111111`，标题“雾港来信”，包含第一章计划与章节
- 浏览器窗口：`1440 × 960`
- 页面错误：0；HTTP 4xx/5xx：0
- 页面出现：`雾港来信`、`第1章：第一章：旧邮戳`、`Read Only`

截图：[Harness 只读作品会话](readonly-book-session.png)

`dreamstory-readonly-adapter.js` 仅实现读取 RPC；创建 Session、workspace、发送消息和命令执行明确返回只读错误。P3.6-5 才接入作者操作与类型化 DreamStory 命令。
