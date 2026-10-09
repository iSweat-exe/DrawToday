// Loaded before everything else (see vitest.config.ts): React only listens to `animationend` when the browser has
// `AnimationEvent`, which jsdom does not. Without this, `onAnimationEnd` never fires in unit tests.
if (typeof window !== "undefined" && !("AnimationEvent" in window)) {
  class AnimationEvent extends Event {
    animationName: string;
    elapsedTime: number;
    pseudoElement: string;
    constructor(
      type: string,
      init: { animationName?: string; elapsedTime?: number; pseudoElement?: string } = {},
    ) {
      super(type, init as EventInit);
      this.animationName = init.animationName ?? "";
      this.elapsedTime = init.elapsedTime ?? 0;
      this.pseudoElement = init.pseudoElement ?? "";
    }
  }
  Object.defineProperty(window, "AnimationEvent", {
    value: AnimationEvent,
    configurable: true,
    writable: true,
  });
}
