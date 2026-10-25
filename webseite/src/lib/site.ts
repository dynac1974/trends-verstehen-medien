// Brand links and the channel's video list (read live from the public YouTube RSS feed).
export const SITE = {
  name: "Trends verstehen",
  claim: "Die Trends des Tages. Einfach erklärt.",
  youtube: "https://www.youtube.com/@Trendsverstehen",
  subscribe: "https://www.youtube.com/@Trendsverstehen?sub_confirmation=1",
  shorts: "https://www.youtube.com/@Trendsverstehen/shorts",
  facebook: "https://www.facebook.com/1326705053867611",
  channelId: "UCtrAJBM_gNZ7zA-EF0Y7d-Q",
};

export interface Video {
  id: string;
  title: string;
  published: string;
  url: string;
  thumb: string;
  short: boolean;
}

// Shown when the feed cannot be read, so the page never renders empty.
const FALLBACK: Video[] = [
  ["nE1l0jhuNZI", "Zeitumstellung 2026: Warum stellen wir die Uhr immer noch um? (einfach erklärt)", "2026-10-24T06:11:06+00:00", false],
  ["QtsGTdiSHBw", "Berlin will 160.000 Wohnungen übernehmen: Was heißt Enteignung? (einfach erklärt)", "2026-10-23T18:41:48+00:00", false],
  ["Xd3egrBWA1A", "PHP2Shell – die gefährliche PHP-Lücke einfach erklärt", "2026-10-22T05:53:43+00:00", false],
  ["qb6o6DemgjU", "Der „fliegende“ Tesla Roadster", "2026-10-21T07:55:48+00:00", false],
  ["DfhJUHHqtAY", "Orkan-Warnung: Was bedeutet Rot? 🌪️ #shorts", "2026-10-25T11:00:53+00:00", true],
  ["QhWcSGazQbE", "Dieses Auto fliegt mit Luft?! 🚀 Tesla Roadster erklärt #shorts", "2026-10-24T16:02:35+00:00", true],
  ["spZqgvr-p8k", "Heute Nacht: Uhr zurück! Aber warum noch? 🕒 #shorts", "2026-10-24T13:01:04+00:00", true],
  ["D3XI9ANuw50", "Darf Berlin 160.000 Wohnungen enteignen? 🤯 #shorts", "2026-10-24T10:01:34+00:00", true],
].map(([id, title, published, short]) => toVideo(id as string, title as string, published as string, short as boolean));

function toVideo(id: string, title: string, published: string, short: boolean): Video {
  return {
    id,
    title,
    published,
    short,
    url: short ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

// Shorts whose title carries no "#shorts".
const KNOWN_SHORTS = new Set(["i1g6K6hDSKE", "Ph-gnmrJJ1g", "X-DIcPBl9Js"]);

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Latest channel videos; Shorts are recognised by "#shorts" in the title or a /shorts/ link. */
export async function fetchVideos(): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.channelId}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return FALLBACK;
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);
    const videos = entries
      .map((e) => {
        const id = e.match(/<yt:videoId>([^<]+)</)?.[1];
        const title = decode(e.match(/<title>([^<]*)</)?.[1] ?? "");
        const published = e.match(/<published>([^<]+)</)?.[1] ?? "";
        const link = e.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? "";
        if (!id) return null;
        return toVideo(id, title, published, KNOWN_SHORTS.has(id) || /#shorts/i.test(title) || link.includes("/shorts/"));
      })
      .filter((v): v is Video => v !== null);
    return videos.length ? videos : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export const shortDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "";
