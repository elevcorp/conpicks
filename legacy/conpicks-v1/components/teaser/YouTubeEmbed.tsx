"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

function idFrom(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const [play, setPlay] = useState(false);
  const id = idFrom(url);
  if (!id)
    return (
      <a href={url} target="_blank" className="text-sm text-brand-accent underline">
        {title}
      </a>
    );

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {play ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          onClick={() => setPlay(true)}
          className="group relative h-full w-full"
        >
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
          <span className="absolute inset-0 grid place-items-center bg-black/30">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-red-600 text-white">
              <Play className="h-6 w-6 fill-white" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
