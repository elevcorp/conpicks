import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getRankingConfig,
  getTeaserBySlug,
  getUserReactions,
} from "@/lib/data";
import { DEFAULT_WEIGHTS } from "@/lib/ranking/score";
import { compactCount, runtime, timeAgo } from "@/lib/format";
import { ActionBar } from "./ActionBar";
import { CommentSection } from "./CommentSection";
import { GenreChips } from "./GenreChips";
import { LoglineExpand } from "./LoglineExpand";
import { RankDeltaBadge } from "./RankBits";
import { ScoreCompositionBar } from "./ScoreCompositionBar";
import { TeaserCard } from "./TeaserCard";
import { VideoPlayer } from "./VideoPlayer";
import { YouTubeEmbed } from "./YouTubeEmbed";

export async function TeaserDetail({ slug }: { slug: string }) {
  const detail = await getTeaserBySlug(slug);
  if (!detail) notFound();

  const user = await getSessionUser();
  const { teaser, stats, creator, rankDelta, similar } = detail;
  const weights = { ...DEFAULT_WEIGHTS, ...(await getRankingConfig(teaser.season_id)) };
  const reactions = user
    ? await getUserReactions(user.id, teaser.id)
    : { liked: false, saved: false };
  const ownTeaser = user?.id === teaser.creator_id;

  return (
    <article className="space-y-5 pb-10">
      <VideoPlayer
        src={teaser.playback_url}
        poster={teaser.poster_url}
        teaserId={teaser.id}
      />

      <header className="space-y-3">
        <h1 className="text-xl font-extrabold">{teaser.title}</h1>

        <div className="flex items-center gap-2">
          <Image
            src={creator.avatar_url ?? "/icon.svg"}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full bg-bg-elevated"
            unoptimized
          />
          <Link
            href={`/u/${encodeURIComponent(creator.nickname)}`}
            className="text-sm font-semibold"
          >
            {creator.nickname}
          </Link>
          {!ownTeaser && (
            <button className="ml-1 rounded-full border border-border px-2.5 py-0.5 text-[11px] text-text-secondary">
              팔로우
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <GenreChips genres={teaser.genres} asLinks />
          <span>·</span>
          <span>{runtime(teaser.duration_sec)}</span>
          <span>·</span>
          <span>
            {teaser.published_at ? timeAgo(teaser.published_at) : "심사 중"}
          </span>
        </div>

        <LoglineExpand text={teaser.logline} />
      </header>

      <ActionBar
        teaserId={teaser.id}
        slug={teaser.slug}
        loggedIn={!!user}
        ownTeaser={ownTeaser}
        initial={{
          like: stats.like_count,
          comment: stats.comment_count,
          share: stats.share_count,
          save: stats.save_count,
          liked: reactions.liked,
          saved: reactions.saved,
        }}
      />

      {stats.rank > 0 && (
        <section className="space-y-3 rounded-xl border border-border bg-bg-elevated/60 p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">
              현재 <span className="text-brand-gradient">{stats.rank}위</span>
            </span>
            <RankDeltaBadge delta={rankDelta} />
            <span className="text-text-muted">
              {rankDelta === null
                ? "· 랭킹 신규 진입"
                : rankDelta === 0
                  ? "· 어제와 동일"
                  : rankDelta > 0
                    ? `· 어제보다 ${rankDelta}계단 상승`
                    : `· 어제보다 ${-rankDelta}계단 하락`}
            </span>
          </div>
          <ScoreCompositionBar stats={stats} weights={weights} />
        </section>
      )}

      {teaser.synopsis && (
        <section className="space-y-1">
          <h3 className="text-sm font-bold">시놉시스</h3>
          <p className="text-sm whitespace-pre-line text-text-secondary">
            {teaser.synopsis}
          </p>
        </section>
      )}

      {(teaser.ai_tools.length > 0 || teaser.credits) && (
        <section className="space-y-1 text-xs text-text-muted">
          {teaser.ai_tools.length > 0 && (
            <p>사용 AI 툴 · {teaser.ai_tools.join(", ")}</p>
          )}
          {teaser.credits && <p>{teaser.credits}</p>}
        </section>
      )}

      {teaser.jimovie_review_url && (
        <section className="space-y-2">
          <h3 className="text-sm font-bold">지무비 리뷰 보기</h3>
          <YouTubeEmbed
            url={teaser.jimovie_review_url}
            title={`지무비 리뷰 — ${teaser.title}`}
          />
        </section>
      )}

      <div id="comments" className="scroll-mt-16">
        <CommentSection
          teaserId={teaser.id}
          count={stats.comment_count}
          loggedIn={!!user}
        />
      </div>

      {similar.length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-sm font-bold">비슷한 작품</h3>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {similar.map((vm) => (
              <TeaserCard
                key={vm.teaser.id}
                vm={vm}
                className="w-[8.5rem] shrink-0"
              />
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-[11px] text-text-muted">
        조회 {compactCount(stats.view_start)} · 완주 {compactCount(stats.view_complete)}
      </p>
    </article>
  );
}
