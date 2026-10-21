import { createServer, type Server } from 'node:http';
import { fileURLToPath } from 'node:url';

export const WEB_HOST = '127.0.0.1' as const;
export const DEFAULT_WEB_PORT = 5173;

export const WEB_SHELL_HTML = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DreamStory</title>
  </head>
  <body>
    <main>
      <h1>DreamStory</h1>
      <p>本地优先的小说创作工作台。</p>
    </main>
  </body>
</html>`;

export interface WebServerOptions {
  host?: string;
  port?: number;
}

export function createWebServer(options: WebServerOptions = {}): Server {
  const host = options.host ?? WEB_HOST;
  const port = options.port ?? DEFAULT_WEB_PORT;

  if (host !== WEB_HOST) {
    throw new Error('The web server must listen on 127.0.0.1.');
  }
  if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) {
    throw new Error('The web server port must be between 0 and 65535.');
  }

  return createServer((request, response) => {
    if (request.method !== 'GET' || (request.url !== '/' && request.url !== '/index.html')) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
      return;
    }

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(WEB_SHELL_HTML);
  });
}

export async function startWebServer(options: WebServerOptions = {}): Promise<Server> {
  const server = createWebServer(options);
  const host = options.host ?? WEB_HOST;
  const port = options.port ?? DEFAULT_WEB_PORT;

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  return server;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  startWebServer().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
