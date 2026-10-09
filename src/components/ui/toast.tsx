"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { haptic, type HapticPattern } from "@/lib/haptics";
import { CheckIcon, CloseIcon, StarIcon } from "./icons";

export type ToastTone = "success" | "error" | "info";

export type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** How long it stays, in ms (default 3500). */
  duration?: number;
};

type ToastEntry = Required<Pick<ToastOptions, "title" | "tone" | "duration">> &
  Pick<ToastOptions, "description"> & { id: number };

type ToastApi = {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** At most this many toasts are visible; the oldest leaves when a new one arrives. */
export const MAX_TOASTS = 3;
export const DEFAULT_TOAST_DURATION = 3500;

const HAPTIC_BY_TONE: Record<ToastTone, HapticPattern> = {
  success: "success",
  error: "error",
  info: "tap",
};
const ICON_BY_TONE: Record<ToastTone, ReactNode> = {
  success: <CheckIcon width={20} height={20} />,
  error: <CloseIcon width={20} height={20} />,
  info: <StarIcon width={20} height={20} fill="currentColor" />,
};
const COLOR_BY_TONE: Record<ToastTone, string> = {
  success: "bg-success text-accent-ink",
  error: "bg-danger text-accent-ink",
  info: "bg-reward text-reward-ink",
};

function ToastItem({ entry, onDismiss }: { entry: ToastEntry; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(entry.id), entry.duration);
    return () => clearTimeout(timer);
  }, [entry.id, entry.duration, onDismiss]);

  return (
    <button
      type="button"
      role={entry.tone === "error" ? "alert" : "status"}
      onClick={() => onDismiss(entry.id)}
      className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-card border-2 border-outline bg-card p-3 text-left shadow-pop"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-outline",
          COLOR_BY_TONE[entry.tone],
        )}
      >
        {ICON_BY_TONE[entry.tone]}
      </span>
      <span className="flex flex-col">
        <span className="font-display text-base font-semibold">{entry.title}</span>
        {entry.description && <span className="text-sm text-muted">{entry.description}</span>}
      </span>
    </button>
  );
}

/**
 * Provides `useToast()` to the whole app and renders the toasts at the top of the screen, under the status bar.
 * Short, readable messages that disappear by themselves; a tap dismisses them at once.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = nextId.current;
    nextId.current += 1;
    const tone = options.tone ?? "info";
    const entry: ToastEntry = {
      id,
      title: options.title,
      description: options.description,
      tone,
      duration: options.duration ?? DEFAULT_TOAST_DURATION,
    };
    haptic(HAPTIC_BY_TONE[tone]);
    setEntries((current) => [...current, entry].slice(-MAX_TOASTS));
    return id;
  }, []);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-3 pt-[max(env(safe-area-inset-top),0.75rem)]"
      >
        {entries.map((entry) => (
          <ToastItem key={entry.id} entry={entry} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Shows toasts. Must be used under a `ToastProvider` (the root layout has one).
 * @throws When there is no provider above the component.
 */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a <ToastProvider>");
  return context;
}
