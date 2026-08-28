import { z } from "zod";
import { env } from "@/lib/env";
import { handler, ok, parse, requireUserApi } from "@/lib/api";

const Body = z.object({
  maxDurationSeconds: z.number().int().min(1).max(3600).default(240),
});

/**
 * Issues a direct-upload target for the configured video provider.
 *  - cloudflare : Cloudflare Stream direct_upload URL
 *  - supabase   : signed upload URL into the teasers bucket
 *  - mock       : echoes a sample URL (dev)
 */
export const POST = handler(async (req) => {
  const user = await requireUserApi();
  if (user.role !== "creator" && user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  const { maxDurationSeconds } = await parse(req, Body);

  if (env.videoProvider === "cloudflare") {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.cloudflareAccountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.cloudflareStreamToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds,
          requireSignedURLs: false,
          creator: user.id,
        }),
      },
    );
    const json = await res.json();
    if (!res.ok) throw new Error("Cloudflare Stream 업로드 URL 발급 실패");
    return ok({
      provider: "cloudflare",
      uploadUrl: json.result.uploadURL,
      videoId: json.result.uid,
    });
  }

  if (env.videoProvider === "supabase") {
    return ok({
      provider: "supabase",
      bucket: env.supabaseVideoBucket,
      path: `${user.id}/${crypto.randomUUID()}.mp4`,
      note: "클라이언트에서 supabase.storage.from(bucket).uploadToSignedUrl 사용",
    });
  }

  return ok({
    provider: "mock",
    uploadUrl: null,
    videoId: `mock_${crypto.randomUUID()}`,
    playbackUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  });
});
