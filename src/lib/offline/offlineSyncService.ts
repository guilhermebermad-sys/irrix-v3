/**
 * Offline Sync Service — IrriX
 *
 * Manages a queue of pending operations in localStorage.
 * When the device comes back online, it flushes the queue to Supabase.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────
export interface PendingOperation {
  id: string;
  table: string;
  type: "insert" | "upsert";
  payload: Record<string, unknown>;
  onConflict?: string;
  timestamp: number;
}

const QUEUE_KEY = "irrix-sync-queue";

// ─── Queue helpers ───────────────────────────────────────────────────
function readQueue(): PendingOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingOperation[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingOperation[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Add an operation to the offline queue. */
export function enqueue(op: Omit<PendingOperation, "id" | "timestamp">): void {
  const queue = readQueue();
  queue.push({
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  writeQueue(queue);
  window.dispatchEvent(new CustomEvent("irrix-queue-change"));
}

/** Return current number of pending operations. */
export function getQueueSize(): number {
  return readQueue().length;
}

/** Return all pending operations (read-only snapshot). */
export function getPendingOperations(): PendingOperation[] {
  return readQueue();
}

// ─── Sync engine ─────────────────────────────────────────────────────
let syncing = false;

/**
 * Process the offline queue — tries to push each operation to Supabase.
 * Successfully synced items are removed; failures remain for next attempt.
 */
export async function processQueue(): Promise<{ synced: number; failed: number }> {
  if (syncing) return { synced: 0, failed: 0 };
  syncing = true;

  const queue = readQueue();
  if (queue.length === 0) {
    syncing = false;
    return { synced: 0, failed: 0 };
  }

  const remaining: PendingOperation[] = [];
  let synced = 0;

  for (const op of queue) {
    try {
      let error: unknown = null;

      const tbl = supabase.from(op.table as any) as any;
      if (op.type === "insert") {
        const res = await tbl.insert(op.payload);
        error = res.error;
      } else if (op.type === "upsert") {
        const res = await tbl.upsert(op.payload, op.onConflict ? { onConflict: op.onConflict } : undefined);
        error = res.error;
      }

      if (error) {
        console.warn(`[OfflineSync] Failed to sync op ${op.id}:`, error);
        remaining.push(op);
      } else {
        synced++;
      }
    } catch (err) {
      console.warn(`[OfflineSync] Network error for op ${op.id}:`, err);
      remaining.push(op);
    }
  }

  writeQueue(remaining);
  syncing = false;
  window.dispatchEvent(new CustomEvent("irrix-queue-change"));
  return { synced, failed: remaining.length };
}

// ─── Auto-sync on reconnect ─────────────────────────────────────────
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[OfflineSync] Back online — flushing queue…");
    processQueue();
  });
}
