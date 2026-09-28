"use client";
import { Row } from "@/components/common/Section";
import { TeaserCard, Top10Card, teaserW } from "./TeaserCards";
import type { Film } from "@/lib/types";

export function TeaserRow({ films }: { films: Film[] }) {
  return (
    <Row>
      {films.map((f) => (
        <TeaserCard key={f.id} film={f} className={teaserW} />
      ))}
    </Row>
  );
}

export function Top10Row({ films }: { films: Film[] }) {
  return (
    <Row itemClass="gap-1 md:gap-3">
      {films.map((f) => (
        <Top10Card key={f.id} film={f} />
      ))}
    </Row>
  );
}
