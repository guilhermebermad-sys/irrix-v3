import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initNotifications } from "./lib/notifications/pushNotificationService";
import "./index.css";

// Register PWA Service Worker (auto update + reload on new version)
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onRegistered(registration) {
    console.log("[SW] Service Worker registered:", registration);
    // Verifica atualização periodicamente
    if (registration) {
      setInterval(() => registration.update().catch(() => {}), 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error("[SW] Registration failed:", error);
  },
});

// Limpa caches antigos do PWA (que podem estar servindo bundle quebrado)
if (typeof window !== "undefined" && "caches" in window) {
  const CLEANUP_KEY = "__pwa_cache_cleanup_v2";
  if (!localStorage.getItem(CLEANUP_KEY)) {
    caches.keys().then((names) => {
      Promise.all(names.map((n) => caches.delete(n))).then(() => {
        localStorage.setItem(CLEANUP_KEY, "1");
      });
    }).catch(() => {});
  }
}

// Initialize push notifications (if permission already granted)
initNotifications();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
