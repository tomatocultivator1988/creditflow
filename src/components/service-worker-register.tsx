"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    async function setup() {
      // Clear all caches from previous SW versions
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // Unregister any old SW, then register fresh
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
        await navigator.serviceWorker.register("/sw.js");
      }
    }
    setup();
  }, []);

  return null;
}
