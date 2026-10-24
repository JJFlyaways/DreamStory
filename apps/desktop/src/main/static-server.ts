import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import {
  createServer,
  request as requestBackend,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import { extname, resolve, sep } from 'node:path';

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

export async function startWebServer(
  webRoot: string,
  backendOrigin: string,
  port: number,
): Promise<Server> {
  const root = resolve(webRoot);
  const server = createServer((request, response) => {
    void handleRequest(request, response, root, backendOrigin).catch((error: unknown) => {
      if (response.headersSent) {
        response.destroy(error instanceof Error ? error : undefined);
        return;
      }
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('DreamStory desktop web host failed.');
    });
  });
  await listen(server, port);
  return server;
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  webRoot: string,
  backendOrigin: string,
): Promise<void> {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  if (requestUrl.pathname.startsWith('/api/')) {
    await proxyApiRequest(request, response, requestUrl, backendOrigin);
    return;
  }

  const pathname = decodeURIComponent(requestUrl.pathname);
  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = resolve(webRoot, requestedPath);
  if (candidate !== webRoot && !candidate.startsWith(`${webRoot}${sep}`)) {
    response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Forbidden.');
    return;
  }

  let filePath = candidate;
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) throw new Error('Not a file');
  } catch {
    filePath = resolve(webRoot, 'index.html');
  }

  const contentType = contentTypes[extname(filePath)] ?? 'application/octet-stream';
  response.writeHead(200, {
    'cache-control': 'no-cache',
    'content-type': contentType,
  });
  if (request.method !== 'HEAD') createReadStream(filePath).pipe(response);
  else response.end();
}

async function proxyApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
  requestUrl: URL,
  backendOrigin: string,
): Promise<void> {
  const backendUrl = new URL(requestUrl.pathname + requestUrl.search, backendOrigin);
  const headers = { ...request.headers, host: backendUrl.host, connection: 'close' };
  const proxy = requestBackend(backendUrl, { method: request.method, headers });
  proxy.on('response', (backendResponse) => {
    const responseHeaders: Record<string, string | string[]> = {};
    for (const [name, value] of Object.entries(backendResponse.headers)) {
      if (value !== undefined && name !== 'connection' && name !== 'keep-alive') {
        responseHeaders[name] = value;
      }
    }
    response.writeHead(backendResponse.statusCode ?? 502, responseHeaders);
    backendResponse.pipe(response);
  });
  proxy.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('DreamStory local API is unavailable.');
    } else {
      response.destroy();
    }
  });
  request.on('aborted', () => proxy.destroy());
  response.on('close', () => {
    if (!response.writableEnded) proxy.destroy();
  });
  request.pipe(proxy);
}

function listen(server: Server, port: number): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolvePromise();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}
