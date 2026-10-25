// The blog feed for "Trends verstehen": category pills, a card grid and load-more on useBlogFeed.
import { useBlogFeed } from "../../hooks/blog/useBlogFeed";
import { formatCount, postMetaLine, postPath } from "../../wix/blog/posts";
import { imgAttrs } from "../../wix/media";
import type { BlogCategory, BlogTag, PostPage, PostSummary } from "../../wix/blog/types";

const ACCENTS = ["#1597D1", "#F2A100", "#E23744", "#12A26A"];

export function TrendCard({ post, index = 0 }: { post: PostSummary; index?: number }) {
  const accent = ACCENTS[index % ACCENTS.length];
  const counters = [
    post.viewCount ? `${formatCount(post.viewCount, "compact", "de-DE")} Aufrufe` : "",
    post.likeCount !== undefined && post.likeCount > 0 ? `${formatCount(post.likeCount, "compact", "de-DE")} Likes` : "",
  ].filter(Boolean);
  return (
    <a
      href={postPath(post.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card no-underline shadow-[0_1px_2px_rgba(21,33,63,.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(21,33,63,.35)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
        {post.coverUrl ? (
          <img
            {...imgAttrs(post.coverUrl, "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", 9 / 16)}
            alt={post.coverAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid-bg flex h-full items-center justify-center p-6 text-center text-lg font-extrabold text-foreground">
            {post.title}
          </div>
        )}
        <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: accent }} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-blue-ink">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">{post.excerpt}</p>}
        <p className="mt-auto pt-4 text-sm text-muted-foreground">
          <time dateTime={post.dateISO}>{postMetaLine(post)}</time>
          {counters.length > 0 && <span> · {counters.join(" · ")}</span>}
        </p>
      </div>
    </a>
  );
}

const pill = (active: boolean) =>
  `rounded-control border px-4 py-2 text-sm font-semibold no-underline transition-colors ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-secondary"
  }`;

export default function TrendFeed(props: {
  initialPage?: PostPage;
  initialCategoryId?: string | null;
  initialTagId?: string | null;
  initialCategories?: BlogCategory[];
  initialTags?: BlogTag[];
  categoryHref?: (slug: string) => string;
  emptyMessage?: string;
}) {
  const { categoryHref, emptyMessage = "Hier erscheinen bald die ersten Beiträge.", ...feedProps } = props;
  const { posts, categories, activeCategoryId, setActiveCategoryId, hasMore, loadMore, loadingMore, error } = useBlogFeed(feedProps);
  const visible = categories.filter((c) => c.postCount > 0);

  return (
    <div>
      {visible.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Kategorien">
          {categoryHref ? (
            <>
              <a href="/blog" className={pill(activeCategoryId === null)} aria-current={activeCategoryId === null ? "page" : undefined}>
                Alle Themen
              </a>
              {visible.map((c) => (
                <a key={c.id} href={categoryHref(c.slug)} className={pill(activeCategoryId === c.id)} aria-current={activeCategoryId === c.id ? "page" : undefined}>
                  {c.label}
                </a>
              ))}
            </>
          ) : (
            <>
              <button type="button" className={pill(activeCategoryId === null)} onClick={() => setActiveCategoryId(null)}>
                Alle Themen
              </button>
              {visible.map((c) => (
                <button key={c.id} type="button" className={pill(activeCategoryId === c.id)} onClick={() => setActiveCategoryId(c.id)}>
                  {c.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-card py-10 text-center text-destructive" role="alert">
          Die Beiträge konnten gerade nicht geladen werden. Bitte versuch es gleich noch einmal.
        </p>
      )}
      {posts === null ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="aspect-[16/9] animate-pulse bg-secondary" />
              <div className="space-y-2 p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        !error && <p className="rounded-lg border border-dashed border-border py-14 text-center text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <TrendCard key={p.id} post={p} index={i} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-control border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                {loadingMore ? "Lädt…" : "Weitere Beiträge laden"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
