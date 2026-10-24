import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('dreamstoryDesktop', {
  isDesktop: true,
  platform: process.platform,
  electronVersion: process.versions.electron ?? 'unknown',
});
