"use client";

import { Check, Film, Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { runtime } from "@/lib/format";
import { GENRES, type Genre } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const AI_TOOLS = [
  "Sora",
  "Runway Gen-3",
  "Kling",
  "Luma Dream Machine",
  "Midjourney",
  "Pika",
  "Veo",
  "Stable Diffusion",
  "Suno",
];

export function UploadWizard({
  minSec,
  maxSec,
  maxMb,
  creatorTools,
}: {
  minSec: number;
  maxSec: number;
  maxMb: number;
  creatorTools: string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // step 1
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState<{
    playbackUrl: string;
    videoId: string;
    provider: string;
  } | null>(null);
  const [fileErr, setFileErr] = useState<string | null>(null);

  // step 2
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState("");
  const [tools, setTools] = useState<string[]>(creatorTools);
  const [credits, setCredits] = useState("");

  // step 3
  const [agree, setAgree] = useState({ copyright: false, rules: false, revenue: false });
  const [submitting, setSubmitting] = useState(false);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileErr(null);
    setUploaded(null);
    if (!/(mp4|quicktime|mov)/i.test(f.type) && !/\.(mp4|mov)$/i.test(f.name)) {
      setFileErr("mp4 또는 mov 파일만 업로드할 수 있어요.");
      return;
    }
    if (f.size > maxMb * 1024 * 1024) {
      setFileErr(`최대 ${maxMb}MB까지 업로드할 수 있어요.`);
      return;
    }
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = url;
    probe.onloadedmetadata = () => {
      const d = Math.round(probe.duration);
      setDuration(d);
      if (d < minSec || d > maxSec) {
        setFileErr(
          `영상 길이는 ${runtime(minSec)}~${runtime(maxSec)} 사이여야 해요 (현재 ${runtime(d)}).`,
        );
      }
    };
  }

  async function startUpload() {
    if (!videoUrl || !duration || fileErr) return;
    setUploading(true);
    setProgress(0);
    // simulated progress (mock mode); real providers stream to the direct URL
    const timer = setInterval(
      () => setProgress((p) => Math.min(95, p + Math.random() * 18)),
      220,
    );
    try {
      const res = await fetch("/api/video/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxDurationSeconds: maxSec }),
      });
      const json = await res.json();
      await new Promise((r) => setTimeout(r, 1200));
      setUploaded({
        playbackUrl:
          json.playbackUrl ??
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        videoId: json.videoId ?? `mock_${Date.now()}`,
        provider: json.provider ?? "mock",
      });
      setProgress(100);
    } catch {
      toast.error("업로드에 실패했어요. 다시 시도해 주세요.");
    } finally {
      clearInterval(timer);
      setUploading(false);
    }
  }

  function toggleGenre(g: Genre) {
    setGenres((cur) =>
      cur.includes(g)
        ? cur.filter((x) => x !== g)
        : cur.length < 2
          ? [...cur, g]
          : cur,
    );
  }

  const step2Valid =
    title.trim().length > 0 &&
    logline.trim().length > 0 &&
    genres.length >= 1 &&
    tools.length >= 1;

  async function submit() {
    if (!uploaded || !duration) return;
    setSubmitting(true);
    const seed = encodeURIComponent(title || "teaser");
    const res = await fetch("/api/teasers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        logline: logline.trim(),
        synopsis: synopsis.trim(),
        genres,
        tags: tags
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 5),
        durationSec: duration,
        aiTools: tools,
        credits: credits.trim(),
        posterUrl: `https://picsum.photos/seed/${seed}-p/600/900`,
        thumbnailUrl: `https://picsum.photos/seed/${seed}-t/960/540`,
        playbackUrl: uploaded.playbackUrl,
        videoProvider: uploaded.provider,
        videoId: uploaded.videoId,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setStep(1);
      router.push("/upload/submitted");
    } else {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "제출에 실패했어요.");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-2">
      <Stepper step={step} />

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold">1. 영상 업로드</h2>
          <p className="text-xs text-text-muted">
            mp4 / mov · 최대 {maxMb}MB · 길이 {runtime(minSec)}~{runtime(maxSec)}
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime,.mov,.mp4"
            hidden
            onChange={onPickFile}
          />

          {!videoUrl ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-bg-elevated/40 py-12 text-text-muted"
            >
              <UploadCloud className="h-8 w-8" />
              <span className="text-sm">파일 선택</span>
            </button>
          ) : (
            <div className="space-y-3">
              <video
                src={videoUrl}
                controls
                className="aspect-video w-full rounded-xl bg-black"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Film className="h-4 w-4" />
                  {duration != null ? runtime(duration) : "길이 확인 중…"}
                </span>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-text-muted underline"
                >
                  다른 파일
                </button>
              </div>
              {fileErr && <p className="text-sm text-danger">{fileErr}</p>}

              {uploading && <Progress value={progress} className="h-2" />}

              {uploaded ? (
                <p className="flex items-center gap-1.5 text-sm text-success">
                  <Check className="h-4 w-4" /> 업로드 완료
                </p>
              ) : (
                <Button
                  className="w-full"
                  disabled={!!fileErr || duration == null || uploading}
                  onClick={startUpload}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 업로드 중…
                    </>
                  ) : (
                    "업로드 시작"
                  )}
                </Button>
              )}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!uploaded}
            onClick={() => setStep(2)}
          >
            다음
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold">2. 작품 정보</h2>

          <Field label="제목">
            <Input
              value={title}
              maxLength={60}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label={`로그라인 (${logline.length}/120)`}>
            <Textarea
              value={logline}
              maxLength={120}
              rows={2}
              onChange={(e) => setLogline(e.target.value)}
            />
          </Field>
          <Field label={`시놉시스 (${synopsis.length}/1000)`}>
            <Textarea
              value={synopsis}
              maxLength={1000}
              rows={4}
              onChange={(e) => setSynopsis(e.target.value)}
            />
          </Field>

          <Field label="장르 (1~2개)">
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    genres.includes(g)
                      ? "border-brand-gradient text-text-primary"
                      : "border-border text-text-secondary",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>

          <Field label="태그 (쉼표로 구분, 최대 5개)">
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: AI단편, 우주, 느와르"
            />
          </Field>

          <Field label="사용 AI 툴">
            <div className="flex flex-wrap gap-2">
              {AI_TOOLS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setTools((cur) =>
                      cur.includes(t)
                        ? cur.filter((x) => x !== t)
                        : [...cur, t],
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    tools.includes(t)
                      ? "border-brand-gradient text-text-primary"
                      : "border-border text-text-secondary",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="크레딧 (선택)">
            <Input
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="연출·편집·음악 등"
            />
          </Field>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              이전
            </Button>
            <Button
              className="flex-1"
              disabled={!step2Valid}
              onClick={() => setStep(3)}
            >
              다음
            </Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold">3. 동의 및 제출</h2>

          {(
            [
              ["copyright", "업로드한 영상·음악의 저작권 및 사용 권한을 보유하고 있습니다."],
              ["rules", "CONPICKS 심사 규정을 확인했으며, 1차 심사를 통과해야 공개됨을 이해합니다."],
              ["revenue", "우승 시 수익 배분 약관에 동의합니다. (수익배분형 펀딩은 별도 고지)"],
            ] as const
          ).map(([key, text]) => (
            <label key={key} className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={agree[key]}
                onCheckedChange={(v) =>
                  setAgree((a) => ({ ...a, [key]: v === true }))
                }
              />
              <span className="text-text-secondary">{text}</span>
            </label>
          ))}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(2)}>
              이전
            </Button>
            <Button
              className="flex-1"
              disabled={
                submitting || !agree.copyright || !agree.rules || !agree.revenue
              }
              onClick={submit}
            >
              {submitting ? "제출 중…" : "제출하기"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
              n <= step
                ? "bg-brand-gradient text-white"
                : "bg-white/10 text-text-muted",
            )}
          >
            {n}
          </span>
          {n < 3 && (
            <span
              className={cn(
                "h-0.5 flex-1 rounded",
                n < step ? "bg-brand-to" : "bg-white/10",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
