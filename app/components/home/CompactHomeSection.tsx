"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type HomeTile = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  tag?: string;
  meta?: string;
  external?: boolean;
  insetImage?: boolean;
  backgroundImage?: string;
  layeredBeat?: boolean;
};

function HomeCard({ tile }: { tile: HomeTile }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  useEffect(() => setImageFailed(false), [tile.image]);
  useEffect(() => setBackgroundFailed(false), [tile.backgroundImage]);
  const background = tile.layeredBeat && !backgroundFailed ? tile.backgroundImage : undefined;
  const cardClassName = `home-card${tile.layeredBeat ? " home-beat-card" : ""}`;
  const cardStyle = background ? {
    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.82), rgba(0,0,0,0.96)), url(${JSON.stringify(background)})`,
    backgroundPosition: "center center",
    backgroundSize: "cover",
  } : undefined;

  const content = (
    <>
      <div className={`home-card-image${tile.insetImage ? " home-card-image-inset" : ""}`}>
        {tile.layeredBeat && <>
          {background ? <img className="home-beat-background" src={background} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={() => setBackgroundFailed(true)} />
            : <div className="home-beat-background-fallback" aria-hidden="true" />}
          <div className="home-beat-image-shade" aria-hidden="true" />
        </>}
        {tile.image && !imageFailed ? (
          <img className={tile.layeredBeat ? "home-beat-foreground" : undefined} src={tile.image} alt={tile.title} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
        ) : (
          <div className="home-image-fallback"><img src="/images/logo.png" alt="RAF By Design" /></div>
        )}
      </div>
      <div className="home-card-copy">
        <h3>{tile.title}</h3>
        <p>{tile.subtitle || "RAF By Design"}</p>
        <span className="home-card-meta">{tile.external && tile.tag ? `${tile.tag} · ` : ""}{tile.meta || "Explore →"}</span>
      </div>
    </>
  );

  return tile.external ? (
    <a className={cardClassName} style={cardStyle} href={tile.href} target="_blank" rel="noopener noreferrer" title={tile.title} aria-label={`${tile.tag || "RAF"}: ${tile.title}`}>{content}</a>
  ) : (
    <Link className={cardClassName} style={cardStyle} href={tile.href} title={tile.title}>{content}</Link>
  );
}

export default function CompactHomeSection({
  id, title, summary, cards, columns = 4, emptyText = "Loading the latest items…", busy = false, viewMoreHref,
}: {
  id: string;
  title: string;
  summary: string;
  cards: HomeTile[];
  columns?: 2 | 3 | 4;
  emptyText?: string;
  busy?: boolean;
  viewMoreHref?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ previous: false, next: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const update = () => setPosition({
      previous: row.scrollLeft > 2,
      next: row.scrollLeft + row.clientWidth < row.scrollWidth - 2,
    });
    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => { row.removeEventListener("scroll", update); observer.disconnect(); };
  }, [cards.length, columns]);

  function move(direction: number) {
    const row = rowRef.current;
    if (!row) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({ left: direction * row.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return (
    <section className="home-shelf" aria-labelledby={`${id}-heading`} aria-busy={busy}>
      <div className="home-shelf-heading">
        <div>
          <h2 id={`${id}-heading`} className="font-raf">{title}</h2>
          <p>{summary}</p>
        </div>
        <div className="home-row-controls">
          {viewMoreHref && <Link href={viewMoreHref} className="home-view-more" aria-label={`View more ${title.toLowerCase()}`}>View more</Link>}
          <button type="button" aria-label={`Previous ${title} cards`} disabled={!position.previous} onClick={() => move(-1)}>‹</button>
          <button type="button" aria-label={`Next ${title} cards`} disabled={!position.next} onClick={() => move(1)}>›</button>
        </div>
      </div>
      <div ref={rowRef} className={`home-card-row home-card-row-${columns}`} tabIndex={0} aria-label={`${title} cards`}>
        {cards.length ? cards.map((tile) => <HomeCard key={tile.id} tile={tile} />) : <p className="home-shelf-empty" role="status">{emptyText}</p>}
      </div>
    </section>
  );
}

export const compactHomepageCss = `
  .home-compact { font-family: Arial, Helvetica, sans-serif; isolation: isolate; background: #160707; }
  .home-compact::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background-image: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.75)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg'); background-position: center; background-size: cover; background-repeat: no-repeat; }
  .home-compact * { box-sizing: border-box; }
  .home-compact .home-sections { width: 100%; max-width: 1184px; margin: 0 auto; padding: 24px 16px 0; display: grid; gap: 24px; }
  .home-compact .home-shelf { height: 320px; min-width: 0; display: grid; grid-template-rows: 52px minmax(0, 1fr); gap: 12px; padding: 16px; border: 2px solid #080808; border-radius: 14px; background: rgba(0,0,0,.82); box-shadow: 3px 3px 0 #080808; }
  .home-compact .home-shelf-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
  .home-compact .home-shelf-heading > div:first-child { min-width: 0; }
  .home-compact .home-shelf-heading h2 { margin: 0; color: #f87171; font-size: 25px; line-height: 28px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .home-compact .home-shelf-heading p { margin: 5px 0 0; color: #d4d4d8; font-size: 13px; line-height: 18px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .home-compact .home-row-controls { display: flex; flex-shrink: 0; gap: 6px; }
  .home-compact .home-row-controls button { width: 30px; height: 30px; border: 1px solid #52525b; border-radius: 7px; background: #18181b; color: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
  .home-compact .home-row-controls button:hover:not(:disabled) { background: #b91c1c; }
  .home-compact .home-row-controls button:disabled { opacity: .3; cursor: default; }
  .home-compact .home-view-more { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; height: 30px; padding: 0 10px; border: 1px solid #ef4444; border-radius: 7px; background: #b91c1c; color: #fff; font-size: 12px; line-height: 1; font-weight: 700; white-space: nowrap; text-decoration: none; }
  .home-compact .home-view-more:hover { background: #dc2626; }
  .home-compact .home-card-row { display: flex; align-items: stretch; gap: 12px; min-width: 0; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: #7f1d1d transparent; padding: 0 0 6px; }
  .home-compact .home-card { flex: 0 0 calc((100% - 36px) / 4); min-width: 0; display: grid; grid-template-rows: 120px minmax(0, 1fr); border: 1px solid #3f3f46; border-radius: 9px; background: #09090b; overflow: hidden; scroll-snap-align: start; text-decoration: none; color: #fff; transition: border-color .2s; }
  .home-compact .home-card-row-3 .home-card { flex-basis: calc((100% - 24px) / 3); }
  .home-compact .home-card-row-2 .home-card { flex-basis: calc((100% - 12px) / 2); }
  .home-compact .home-card:hover { border-color: #ef4444; }
  .home-compact .home-card-image { position: relative; min-width: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #111113; border-bottom: 1px solid #27272a; }
  .home-compact .home-card-image > img { height: 100%; width: 100%; object-fit: contain; padding: 4px; }
  .home-compact .home-beat-card .home-card-image > .home-beat-background { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; padding: 0; }
  .home-compact .home-beat-background-fallback { position: absolute; inset: 0; background: linear-gradient(to bottom right, #18181b, #09090b, #000); }
  .home-compact .home-beat-image-shade { position: absolute; inset: 0; background: rgba(0,0,0,.1); }
  .home-compact .home-beat-card .home-card-image > .home-beat-foreground { position: relative; z-index: 1; filter: drop-shadow(0 8px 14px rgba(0,0,0,.65)); }
  .home-compact .home-beat-card .home-image-fallback { position: relative; z-index: 1; }
  .home-compact .home-card-image-inset > img { width: 78%; height: 78%; max-width: 230px; object-fit: contain; padding: 8px; }
  .home-compact [aria-labelledby="services-heading"] .home-card-image > img { width: 100%; height: 100%; object-fit: cover; padding: 0; }
  .home-compact .home-card-copy { min-width: 0; padding: 9px 11px; display: flex; flex-direction: column; }
  .home-compact .home-card-copy h3 { margin: 0; height: 34px; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 13px; line-height: 17px; font-weight: 700; }
  .home-compact .home-card-copy p { margin: 3px 0 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #d4d4d8; font-size: 12px; line-height: 16px; }
  .home-compact .home-card-meta { margin-top: auto; padding-top: 3px; font-size: 11px; line-height: 15px; color: #fca5a5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .home-compact .home-image-fallback { height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; }
  .home-compact .home-image-fallback img { width: 64px; height: 64px; object-fit: contain; }
  .home-compact .home-shelf-empty { display: flex; justify-content: center; align-items: center; margin: 0; width: 100%; color: #a1a1aa; font-size: 14px; }
  .home-compact .home-card:focus-visible, .home-compact .home-card-row:focus-visible, .home-compact .home-row-controls button:focus-visible, .home-compact .home-view-more:focus-visible { outline: 2px solid #f87171; outline-offset: -2px; }
  @media (max-width: 767px) {
    .home-compact .home-sections { padding: 20px 12px 0; gap: 20px; }
    .home-compact .home-shelf { padding: 12px; grid-template-rows: 52px minmax(0, 1fr); }
    .home-compact .home-shelf-heading h2 { font-size: 21px; line-height: 25px; }
    .home-compact .home-card-row .home-card { flex-basis: 190px; }
    .home-compact .home-card-image-inset > img { width: 74%; height: 74%; }
  }
  @media (prefers-reduced-motion: reduce) { .home-compact .home-card { transition: none; } }
`;
