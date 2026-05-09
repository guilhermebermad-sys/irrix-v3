/**
 * Push Notification Service — IrriX
 *
 * Handles:
 * 1. Permission request for browser notifications
 * 2. Service Worker push subscription registration
 * 3. Local notification scheduling (7:00 AM BRT daily manejo reminders)
 * 4. Immediate local notifications for alerts
 */

const NOTIFICATION_PERMISSION_KEY = "irrix-notification-permission";
const SCHEDULE_TIMER_KEY = "irrix-schedule-timer";

// ─── Permission ──────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("[Push] Notifications not supported in this browser.");
    return "denied";
  }

  const permission = await Notification.requestPermission();
  localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
  return permission;
}

export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

// ─── Push Subscription (for future server-side push) ─────────────────
export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) {
      console.warn("[Push] PushManager not available.");
      return null;
    }

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) return subscription;

    // Note: VAPID public key would be set here for server-side push
    // For now, we use local notifications only
    console.log("[Push] Push subscription requires VAPID key (server-side setup pending).");
    return null;
  } catch (err) {
    console.warn("[Push] Failed to subscribe:", err);
    return null;
  }
}

// ─── Local Notification Helpers ──────────────────────────────────────
export function showLocalNotification(title: string, body: string, tag?: string): void {
  if (Notification.permission !== "granted") return;

  try {
    // Try to use SW notification (works when app is backgrounded)
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: tag || "irrix-notification",
        ...({ vibrate: [200, 100, 200] } as any),
        data: { url: "/" },
      });
    });
  } catch {
    // Fallback to basic Notification API
    new Notification(title, {
      body,
      icon: "/favicon.png",
      tag: tag || "irrix-notification",
    });
  }
}

// ─── Daily Manejo Reminder (7:00 AM BRT) ─────────────────────────────
let scheduleTimerId: ReturnType<typeof setTimeout> | null = null;

function getMsUntilNextBRT7AM(): number {
  const now = new Date();

  // BRT is UTC-3
  const brtOffset = -3 * 60; // minutes
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const brtNow = new Date(utcMs + brtOffset * 60_000);

  // Target: 7:00 AM BRT today or tomorrow
  const target = new Date(brtNow);
  target.setHours(7, 0, 0, 0);

  // If 7:00 AM already passed today, schedule for tomorrow
  if (brtNow >= target) {
    target.setDate(target.getDate() + 1);
  }

  // Convert back to local time difference
  const targetUtcMs = target.getTime() - brtOffset * 60_000 - now.getTimezoneOffset() * 60_000;
  return targetUtcMs - now.getTime();
}

export function scheduleDailyReminder(): void {
  if (scheduleTimerId) clearTimeout(scheduleTimerId);

  const ms = getMsUntilNextBRT7AM();
  const hours = (ms / 3_600_000).toFixed(1);
  console.log(`[Push] Next manejo reminder in ${hours}h`);

  scheduleTimerId = setTimeout(() => {
    showLocalNotification(
      "🌱 Hora do Manejo!",
      "Verifique suas recomendações de irrigação para hoje. Abra o IrriX para calcular o balanço hídrico.",
      "irrix-daily-manejo"
    );
    // Reschedule for next day
    scheduleDailyReminder();
  }, ms);
}

export function cancelDailyReminder(): void {
  if (scheduleTimerId) {
    clearTimeout(scheduleTimerId);
    scheduleTimerId = null;
  }
}

// ─── Initialize ──────────────────────────────────────────────────────
export async function initNotifications(): Promise<void> {
  const permission = getNotificationPermission();
  if (permission === "granted") {
    scheduleDailyReminder();
    await subscribeToPush();
  }
}
