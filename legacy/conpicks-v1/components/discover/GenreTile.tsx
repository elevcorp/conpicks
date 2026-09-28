"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Genre } from "@/lib/types";

const BG: Record<Genre, string> = {
  SF: "from-[#0b3a66] to-[#0f1014]",
  스릴러: "from-[#3a1030] to-[#0f1014]",
  로맨스: "from-[#5a1436] to-[#0f1014]",
  판타지: "from-[#2a1a5a] to-[#0f1014]",
  공포: "from-[#3a0f0f] to-[#0f1014]",
  드라마: "from-[#123a3a] to-[#0f1014]",
  애니메이션: "from-[#0f2a5a] to-[#0f1014]",
  다큐: "from-[#33330f] to-[#0f1014]",
};

export function GenreTile({
  genre,
  preview,
}: {
  genre: Genre;
  preview?: { poster: string; video: string } | null;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/discover/${encodeURIComponent(genre)}`}>
      <motion.div
        whileHover={{ scale: 1.04 }}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        className={`relative flex aspect-[16/10] items-end overflow-hidden rounded-xl border border-border bg-gradient-to-br ${BG[genre]} p-3`}
      >
        {preview && (
          <>
            <Image
              src={preview.poster}
              alt=""
              fill
              sizes="50vw"
              className="object-cover opacity-25"
            />
            {hover && (
              <video
                src={preview.video}
                muted
                autoPlay
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
            )}
          </>
        )}
        <span className="relative text-lg font-extrabold text-white drop-shadow">
          {genre}
        </span>
      </motion.div>
    </Link>
  );
}
