import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CONPICKS",
    short_name: "CONPICKS",
    description: "AI 영화 티저 경쟁 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1014",
    theme_color: "#0F1014",
    icons: [
      { src: "/pwa-icon.png", sizes: "174x203", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
