import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ safe polyfill – only when geolocation is completely missing
if (typeof navigator !== "undefined" && !("geolocation" in navigator)) {
  // create a minimal, non-blocking polyfill
  ;(navigator as any).geolocation = {
    getCurrentPosition(success: PositionCallback, error?: PositionErrorCallback | null, _options?: PositionOptions) {
      console.warn("[polyfill] navigator.geolocation.getCurrentPosition is not available in this environment.")
      if (typeof error === "function") {
        error({
          code: 1, // PERMISSION_DENIED
          message: "Geolocation is not supported.",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      }
    },
    watchPosition() {
      console.warn("[polyfill] navigator.geolocation.watchPosition is not available.")
      return -1
    },
    clearWatch() {
      /* noop */
    },
  } as Geolocation
}
