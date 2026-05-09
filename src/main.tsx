import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initNotifications } from "./lib/notifications/pushNotificationService";
import "./index.css";

// Register PWA Service Worker
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onRegistered(registration) {
    console.log("[SW] Service Worker registered:", registration);
  },
  onRegisterError(error) {
    console.error("[SW] Registration failed:", error);
  },
});

// Initialize push notifications (if permission already granted)
initNotifications();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
