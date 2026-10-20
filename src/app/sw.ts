import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { StaleWhileRevalidate } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// Custom stale-while-revalidate cache for catalog
// This serves cached data immediately, but always updates from network in background
const catalogCache = [
  {
    matcher: ({ url }: { url: URL }) => url.pathname === '/catalog.json',
    handler: new StaleWhileRevalidate({
      cacheName: 'catalog-v1',
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...catalogCache,
    ...defaultCache,
  ],
});

serwist.addEventListeners();
