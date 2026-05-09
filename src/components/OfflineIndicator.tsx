import { WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { processQueue } from "@/lib/offline/offlineSyncService";
import { useState } from "react";

/**
 * Floating banner that appears when the device is offline.
 * Shows the number of pending sync operations and a manual retry button.
 */
export function OfflineIndicator() {
  const { isOnline, pendingCount } = useOnlineStatus();
  const [retrying, setRetrying] = useState(false);

  if (isOnline && pendingCount === 0) return null;

  const handleRetry = async () => {
    setRetrying(true);
    await processQueue();
    setRetrying(false);
  };

  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-500 ease-out"
      style={{
        background: isOnline
          ? "var(--gradient-brand)"
          : "var(--gradient-warning)",
        color: "#fff",
        animation: "slide-up 0.4s ease-out",
      }}
    >
      {!isOnline && <WifiOff className="w-4 h-4 flex-shrink-0" />}

      <span>
        {!isOnline
          ? pendingCount > 0
            ? `📡 Modo Offline — ${pendingCount} registro${pendingCount > 1 ? "s" : ""} pendente${pendingCount > 1 ? "s" : ""} de sincronização`
            : "📡 Modo Offline — Seus dados estão salvos localmente"
          : `✅ Sincronizando ${pendingCount} registro${pendingCount > 1 ? "s" : ""} pendente${pendingCount > 1 ? "s" : ""}…`}
      </span>

      {pendingCount > 0 && isOnline && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="ml-2 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          title="Tentar sincronizar agora"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
