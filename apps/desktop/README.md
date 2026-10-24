# DreamStory Electron 开发客户端

这是 P3.5 的薄桌面壳，不复制 React 页面或业务事实源。

```bash
npx pnpm --filter @dreamstory/desktop dev
```

启动流程：

1. 构建共用的 `apps/server` 和 `apps/web`。
2. Electron 主进程在 `127.0.0.1` 上启动 Fastify 服务，并为 Web 静态资源分配本地端口。
3. 静态 Web 主机将 `/api` 和 SSE 请求代理到本地 Fastify，再加载同一份 `apps/web/dist`。
4. preload 只暴露只读桌面运行信息；渲染器继续通过 HTTP/SSE 使用现有 API。

端口被占用时，主进程会为 API 或 Web 主机选择新的 loopback 端口。安装包、签名、升级和系统凭据存储属于 P5，不在本开发壳范围内。
