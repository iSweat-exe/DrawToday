"use client";

import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { shouldDismissSheet } from "@/lib/sheet-gesture";
import { CloseIcon } from "./icons";

export type BottomSheetProps = {
  open: boolean;
  /** Called when the sheet closes by itself: Escape, a tap on the dim background, a swipe down, the close button. */
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * A panel that slides up from the bottom for secondary actions (choose a duration, confirm). It is a native modal
 * `<dialog>`: focus is trapped, Escape closes it, the page behind is inert. It can be pulled down to dismiss, and
 * springs back when released early.
 */
export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openRef = useRef(open);
  const drag = useRef<{ startY: number; startTime: number; pointerId: number } | null>(null);
  const titleId = useId();

  useEffect(() => {
    openRef.current = open;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    drag.current = {
      startY: event.clientY,
      startTime: event.timeStamp,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (dialogRef.current) dialogRef.current.style.transition = "none";
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || !dialogRef.current) return;
    const distance = Math.max(0, event.clientY - current.startY);
    dialogRef.current.style.transform = `translateY(${distance}px)`;
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    const dialog = dialogRef.current;
    drag.current = null;
    if (!current || !dialog) return;
    const distance = event.clientY - current.startY;
    const duration = event.timeStamp - current.startTime;
    if (shouldDismissSheet(distance, duration, dialog.getBoundingClientRect().height)) {
      dialog.style.transform = "";
      dialog.close();
    } else {
      dialog.style.transition = "transform 320ms var(--ease-spring)";
      dialog.style.transform = "";
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => {
        // Escape, swipe and the button all end here; a close asked by the parent (open=false) is not reported back.
        if (openRef.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className={cn(
        "fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-sheet border-t-2 border-outline bg-card p-0 text-foreground shadow-pop backdrop:animate-fade-in backdrop:bg-black/40 open:animate-sheet-up",
        className,
      )}
    >
      <div className="flex flex-col gap-4 px-gutter pt-2 pb-safe-bottom">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className="-mx-gutter flex cursor-grab touch-none flex-col items-center gap-3 px-gutter pt-1 pb-1 select-none"
          data-testid="sheet-handle"
        >
          <span
            aria-hidden="true"
            className="h-2 w-12 rounded-full border-2 border-outline bg-card"
          />
          <div className="flex w-full items-center justify-between">
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Fermer"
              onClick={(event) => event.currentTarget.closest("dialog")?.close()}
              onPointerDown={(event) => event.stopPropagation()}
              className="pressable flex size-11 items-center justify-center rounded-full border-2 border-outline bg-background"
            >
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </dialog>
  );
}
