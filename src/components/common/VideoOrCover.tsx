"use client";
import { useEffect, useRef } from "react";
import { videoSrc } from "@/lib/assets";
import { cn } from "@/lib/cn";

/**
 * Plays /public/videos/{name}.mp4 as a muted loop when present; otherwise
 * animates the fallback cover with Ken Burns + drifting light so the hero
 * still feels alive. Drop a file in → it just works.
 */
export function VideoOrCover({ name, muted = true, children, className, alt, paused }: {
  name: string;
  muted?: boolean;
  children: React.ReactNode;
  className?: string;
  alt?: boolean;
  paused?: boolean;
}) {
  const src = videoSrc(name);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused]);

  if (src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <video ref={ref} src={src} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className={cn("absolute inset-0", alt ? "kenburns-alt" : "kenburns")} style={paused ? { animationPlayState: "paused" } : undefined}>
        {children}
      </div>
      <div className="light-drift pointer-events-none absolute inset-0" />
    </div>
  );
}

export const hasVideo = (name: string) => !!videoSrc(name);
