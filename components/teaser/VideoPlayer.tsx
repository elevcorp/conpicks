"use client";

import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getViewSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

/**
 * 16:9 player. Muted autoplay start, tap for sound, fullscreen.
 * Emits start / half / complete view events once each.
 */
export function VideoPlayer({
  src,
  poster,
  teaserId,
  className,
  autoPlay = true,
}: {
  src: string;
  poster: string;
  teaserId: string;
  className?: string;
  autoPlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const sent = useRef<Set<string>>(new Set());
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(autoPlay);

  const emit = useCallback(
    (event: "start" | "half" | "complete") => {
      if (sent.current.has(event)) return;
      sent.current.add(event);
      fetch(`/api/teasers/${teaserId}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, sessionId: getViewSessionId() }),
        keepalive: true,
      }).catch(() => {});
    },
    [teaserId],
  );

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      if (v.duration && v.currentTime / v.duration >= 0.5) emit("half");
    };
    const onPlay = () => {
      setPlaying(true);
      emit("start");
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => emit("complete");
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [emit]);

  function togglePlay() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }
  function toggleMute() {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }
  function goFullscreen() {
    ref.current?.requestFullscreen?.().catch(() => {});
  }

  return (
    <div
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-xl bg-black",
        className,
      )}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted={muted}
        autoPlay={autoPlay}
        loop={false}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="h-full w-full object-contain"
      />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={togglePlay}
          className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
          aria-label={playing ? "일시정지" : "재생"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="pointer-events-auto flex gap-2">
          <button
            onClick={toggleMute}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            aria-label={muted ? "소리 켜기" : "음소거"}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={goFullscreen}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            aria-label="전체화면"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
      {muted && (
        <button
          onClick={toggleMute}
          className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur"
        >
          🔇 탭하여 소리 켜기
        </button>
      )}
    </div>
  );
}
