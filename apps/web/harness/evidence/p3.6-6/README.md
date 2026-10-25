# P3.6-6：单一 Web 产物与桌面壳证据

- `apps/web/src` 旧 React 页面、CodeMirror 外壳、自制运行面板、旧 CSS 和旧主题副本已删除。
- `apps/web/index.html` 旧 Vite 入口已删除；Web 构建只复制 `apps/web/harness/runtime` 并注入当前业务 adapter。
- Web 包不再声明 React、CodeMirror、Vite 或旧 React Query 依赖；锁文件已同步清理。
- Electron 主进程仍通过 `resolve(projectRoot, 'apps/web/dist')` 加载同一份 Web 产物，静态服务器只额外代理 `/api` 到本地 Fastify。

验证记录：

- `pnpm --filter @dreamstory/desktop build`：通过。
- Electron smoke：`electron . --no-sandbox --disable-gpu` 保持运行至 15 秒超时，未出现启动异常；测试进程由 timeout 正常终止。
- `apps/web/dist`：164 个固定运行时文件；`index.html` SHA-256：`ec02ca1d89bae966ce616d2d3e5c02e1780177f576cf977a8541461b34854fc0`。
- `rg` 未发现旧 Web 入口、旧样式覆盖或自制运行面板仍被 Web/Electron 引用。

浏览器与 Electron 的差异只保留 Host 传输方式：浏览器直接使用 Web 服务，Electron 通过薄壳代理本地 API；渲染组件、资源、状态适配器和业务产物相同。
