import { useEffect, useState, useCallback } from "react";
import { getQueueSize, processQueue } from "@/lib/offline/offlineSyncService";

/**
 * Hook that tracks online/offline state and the pending sync queue size.
 * Automatically triggers queue processing when connectivity is restored.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(getQueueSize());

  const refreshCount = useCallback(() => {
    setPendingCount(getQueueSize());
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const result = await processQueue();
      if (result.synced > 0) {
        console.log(`[useOnlineStatus] Synced ${result.synced} pending operations`);
      }
      refreshCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      refreshCount();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("irrix-queue-change", handleQueueChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("irrix-queue-change", handleQueueChange);
    };
  }, [refreshCount]);

  return { isOnline, pendingCount };
}
