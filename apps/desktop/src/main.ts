import { app, BrowserWindow, dialog } from 'electron';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { startWebServer } from './main/static-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..', '..', '..');
const serverEntry = resolve(projectRoot, 'apps/server/dist/index.js');
const webRoot = resolve(projectRoot, 'apps/web/dist');
const preferredApiPort = 3_000;
const preferredWebPort = 3_001;

let backendProcess: ChildProcess | null = null;
let webServer: Server | null = null;
let mainWindow: BrowserWindow | null = null;
let stopping = false;

void app.whenReady().then(async () => {
  try {
    await startDesktopRuntime();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown desktop startup error.';
    console.error(message);
    await dialog.showMessageBox({
      type: 'error',
      title: 'DreamStory 启动失败',
      message,
    });
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) void startDesktopRuntime();
});

app.on('before-quit', (event) => {
  if (stopping) return;
  event.preventDefault();
  stopping = true;
  void stopDesktopRuntime().finally(() => app.exit(0));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

async function startDesktopRuntime(): Promise<void> {
  if (mainWindow !== null) {
    mainWindow.focus();
    return;
  }
  if (backendProcess !== null || webServer !== null) await stopDesktopRuntime();

  const apiPort = await findFreePort(preferredApiPort);
  const webPort = await findFreePort(preferredWebPort);
  const webOrigin = `http://127.0.0.1:${webPort}`;
  const backendOrigin = `http://127.0.0.1:${apiPort}`;
  backendProcess = spawnBackend(apiPort, webOrigin);
  backendProcess.once('exit', (code, signal) => {
    if (!stopping && mainWindow !== null) {
      void dialog.showMessageBox({
        type: 'error',
        title: 'DreamStory 服务已退出',
        message: `本地服务已停止（${signal ?? `exit ${code ?? 'unknown'}`}）。`,
      });
      mainWindow.close();
    }
  });
  attachBackendLogs(backendProcess);
  await waitForBackend(backendOrigin, backendProcess);
  webServer = await startWebServer(webRoot, backendOrigin, webPort);
  mainWindow = createWindow(webOrigin);
  await mainWindow.loadURL(webOrigin);
}

function spawnBackend(apiPort: number, webOrigin: string): ChildProcess {
  const nodeExecutable = process.env['DREAMSTORY_NODE'] ?? process.execPath;
  return spawn(nodeExecutable, [serverEntry], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DREAMSTORY_PORT: String(apiPort),
      DREAMSTORY_ALLOWED_ORIGINS: webOrigin,
      ...(nodeExecutable === process.execPath ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function attachBackendLogs(processHandle: ChildProcess): void {
  processHandle.stdout?.on('data', (chunk: Buffer) => console.log(`[server] ${chunk.toString()}`));
  processHandle.stderr?.on('data', (chunk: Buffer) =>
    console.error(`[server] ${chunk.toString()}`),
  );
}

async function waitForBackend(origin: string, processHandle: ChildProcess): Promise<void> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (processHandle.exitCode !== null) throw new Error('本地服务进程提前退出。');
    try {
      const response = await fetch(`${origin}/api/v1/health`);
      if (response.ok) return;
    } catch {
      // The server is still binding its loopback port.
    }
    await delay(100);
  }
  throw new Error('等待本地服务健康检查超时。');
}

function createWindow(webOrigin: string): BrowserWindow {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 920,
    minHeight: 640,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
      sandbox: true,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== webOrigin) event.preventDefault();
  });
  window.once('ready-to-show', () => window.show());
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null;
  });
  return window;
}

async function stopDesktopRuntime(): Promise<void> {
  mainWindow?.destroy();
  mainWindow = null;
  if (webServer !== null) {
    await new Promise<void>((resolvePromise) => webServer?.close(() => resolvePromise()));
    webServer = null;
  }
  const processHandle = backendProcess;
  backendProcess = null;
  if (processHandle !== null && processHandle.exitCode === null) {
    processHandle.kill();
    await new Promise<void>((resolvePromise) => {
      processHandle.once('exit', () => resolvePromise());
      setTimeout(resolvePromise, 2_000);
    });
  }
}

async function findFreePort(preferredPort: number): Promise<number> {
  try {
    return await probePort(preferredPort);
  } catch (error) {
    if (!isAddressInUse(error)) throw error;
    return probePort(0);
  }
}

function probePort(port: number): Promise<number> {
  return new Promise((resolvePromise, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(port, '127.0.0.1', () => {
      const address = probe.address();
      const assignedPort = typeof address === 'object' && address !== null ? address.port : port;
      probe.close((error) => {
        if (error) reject(error);
        else resolvePromise(assignedPort);
      });
    });
  });
}

function isAddressInUse(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'EADDRINUSE';
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}
