import { ServeSegment } from "@/lib/api";

export interface ServeLookupResult {
  activeIndex: number;
  activeServe: ServeSegment | null;
  inGap: boolean;
  nextServeIndex: number;
}

/**
 * Formats seconds into cumulative MM:SS (e.g. 7199 -> "119:59", 412 -> "06:52"),
 * matching the AI match timestamp format cleanly.
 */
export function formatMatchTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formats a dead-time pause or gap duration in a compact human string (e.g. "1m 07s" or "42s").
 */
export function formatGapDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded}s`;
  const mins = Math.floor(rounded / 60);
  const rem = rounded % 60;
  return rem > 0 ? `${mins}m ${rem.toString().padStart(2, "0")}s` : `${mins}m`;
}

/**
 * O(log N) binary search to locate the serve covering `timeSec` or the next upcoming serve.
 * Assumes `serves` is sorted ascending by `start_sec`.
 */
export function findServeAtTime(serves: ServeSegment[], timeSec: number): ServeLookupResult {
  const n = serves.length;
  if (n === 0) {
    return { activeIndex: -1, activeServe: null, inGap: false, nextServeIndex: -1 };
  }

  let lo = 0;
  let hi = n - 1;
  let candidate = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (serves[mid].start_sec <= timeSec) {
      candidate = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (candidate >= 0) {
    const seg = serves[candidate];
    // Include tiny tolerance at boundary so UI highlight feels seamless
    if (timeSec <= seg.end_sec + 0.15) {
      return {
        activeIndex: candidate,
        activeServe: seg,
        inGap: false,
        nextServeIndex: candidate + 1 < n ? candidate + 1 : -1,
      };
    }
    return {
      activeIndex: -1,
      activeServe: null,
      inGap: true,
      nextServeIndex: candidate + 1 < n ? candidate + 1 : -1,
    };
  }

  return {
    activeIndex: -1,
    activeServe: null,
    inGap: true,
    nextServeIndex: 0,
  };
}

/**
 * Computes clipped [startTime, endTime] bounds with optional symmetric padding,
 * clamped to video duration and backend's 180s max clip ceiling.
 */
export function computePaddedClipBounds(
  serve: ServeSegment,
  paddingSec: number,
  videoDuration?: number
): { startTime: number; endTime: number } {
  const start = Math.max(0, serve.start_sec - paddingSec);
  const maxEnd = videoDuration && videoDuration > 0 ? videoDuration : serve.end_sec + paddingSec;
  let end = Math.min(maxEnd, serve.end_sec + paddingSec);

  if (end <= start) {
    end = start + Math.max(1, serve.duration_s || 1);
  }

  // Respect backend's 180s max clip duration cleanly
  if (end - start > 180) {
    end = Math.min(maxEnd, start + 180);
  }

  return {
    startTime: Number(start.toFixed(1)),
    endTime: Number(end.toFixed(1)),
  };
}
