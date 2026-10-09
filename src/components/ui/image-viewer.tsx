"use client";

import { useEffect, useRef, type PointerEvent, type WheelEvent } from "react";
import {
  clampView,
  distanceBetween,
  doubleTapScale,
  pinchScale,
  zoomAround,
  type ZoomView,
} from "@/lib/zoom";
import { CloseIcon, PlusIcon } from "./icons";

export type ImageViewerProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  /** Description of the image for screen readers. */
  alt: string;
};

const FIT: ZoomView = { scale: 1, x: 0, y: 0 };
const ZOOM_STEP = 1.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 30;

/**
 * Full-screen viewer to enlarge a drawing or a reference image. The page itself cannot be zoomed (the app locks it),
 * so this is how a learner looks at details: pinch with two fingers, double tap, drag when zoomed, mouse wheel on
 * desktop, or the buttons (+, −, fit) for people who cannot pinch. The image never leaves the screen.
 */
export function ImageViewer({ open, onClose, src, alt }: ImageViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const openRef = useRef(open);
  const view = useRef<ZoomView>(FIT);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);

  function stageSize() {
    const rect = stageRef.current?.getBoundingClientRect();
    return {
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
      left: rect?.left ?? 0,
      top: rect?.top ?? 0,
    };
  }

  function apply(next: ZoomView, animate = false) {
    const { width, height } = stageSize();
    const image = imageRef.current;
    view.current = clampView(
      next,
      width,
      height,
      image ? { width: image.offsetWidth, height: image.offsetHeight } : undefined,
    );
    if (!image) return;
    image.style.transition = animate ? "transform 260ms var(--ease-soft)" : "none";
    image.style.transform = `translate(${view.current.x}px, ${view.current.y}px) scale(${view.current.scale})`;
    image.dataset.scale = view.current.scale.toFixed(2);
  }

  /** Zooms to a scale around a point given in viewport coordinates. */
  function zoomTo(scale: number, clientX?: number, clientY?: number, animate = true) {
    const { width, height, left, top } = stageSize();
    const pointX = clientX === undefined ? 0 : clientX - left - width / 2;
    const pointY = clientY === undefined ? 0 : clientY - top - height / 2;
    apply(zoomAround(view.current, scale, pointX, pointY), animate);
  }

  useEffect(() => {
    openRef.current = open;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      view.current = FIT;
      apply(FIT);
    } else if (!open && dialog.open) {
      dialog.close();
    }
    // `apply` only reads refs: it does not need to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        distance: distanceBetween(a!.x, a!.y, b!.x, b!.y),
        scale: view.current.scale,
      };
      lastTap.current = null;
      return;
    }
    // Double tap / double click.
    const now = event.timeStamp;
    const previous = lastTap.current;
    if (
      previous &&
      now - previous.time < DOUBLE_TAP_MS &&
      distanceBetween(previous.x, previous.y, event.clientX, event.clientY) < DOUBLE_TAP_SLOP
    ) {
      lastTap.current = null;
      zoomTo(doubleTapScale(view.current.scale), event.clientX, event.clientY);
    } else {
      lastTap.current = { time: now, x: event.clientX, y: event.clientY };
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const known = pointers.current.get(event.pointerId);
    if (!known) return;
    const previous = { ...known };
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const { width, height, left, top } = stageSize();
      const centerX = (a!.x + b!.x) / 2 - left - width / 2;
      const centerY = (a!.y + b!.y) / 2 - top - height / 2;
      const scale = pinchScale(
        pinch.current.scale,
        pinch.current.distance,
        distanceBetween(a!.x, a!.y, b!.x, b!.y),
      );
      apply(zoomAround(view.current, scale, centerX, centerY));
      return;
    }
    if (view.current.scale > 1) {
      apply({
        ...view.current,
        x: view.current.x + (event.clientX - previous.x),
        y: view.current.y + (event.clientY - previous.y),
      });
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    // Mouse wheel and trackpad pinch (which browsers send as ctrl + wheel).
    zoomTo(
      view.current.scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15),
      event.clientX,
      event.clientY,
      false,
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Visionneuse : ${alt}`}
      onClose={() => {
        if (openRef.current) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black open:animate-fade-in"
    >
      <div
        ref={stageRef}
        data-testid="viewer-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onWheel={onWheel}
        className="absolute inset-0 flex touch-none items-center justify-center overflow-hidden select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- zoomed with CSS transforms: next/image would add nothing here */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          draggable={false}
          data-scale="1.00"
          className="max-h-full max-w-full object-contain will-change-transform"
        />
      </div>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => dialogRef.current?.close()}
          className="pressable flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur"
        >
          <CloseIcon width={22} height={22} />
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-3 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <button
          type="button"
          aria-label="Zoom arrière"
          onClick={() => zoomTo(view.current.scale / ZOOM_STEP)}
          className="pressable flex size-12 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold backdrop-blur"
        >
          <span aria-hidden="true">−</span>
        </button>
        <button
          type="button"
          aria-label="Ajuster à l'écran"
          onClick={() => apply(FIT, true)}
          className="pressable flex h-12 items-center justify-center rounded-full bg-white/15 px-5 text-sm font-semibold backdrop-blur"
        >
          Ajuster
        </button>
        <button
          type="button"
          aria-label="Zoom avant"
          onClick={() => zoomTo(view.current.scale * ZOOM_STEP)}
          className="pressable flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur"
        >
          <PlusIcon width={22} height={22} />
        </button>
      </div>
    </dialog>
  );
}
