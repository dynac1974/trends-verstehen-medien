# Webseite „Trends verstehen“

Quellcode der Wix-Headless-Seite (Astro + Wix Blog).

- Live: https://headless-esbdfhnlamt-marioreuner-140b.wix-site-host.com
- Wix-Dashboard: https://manage.wix.com/dashboard/1386c0ee-e65c-46c4-9cb3-43135392649e

Bauen: Node ≥ 24.18, `npm ci`, `npx astro build`. Veröffentlichen über das Wix-MCP-Tool
`UploadHeadlessWebsiteFiles` (siteId oben). Blogbeiträge brauchen kein neues Release,
die Seite liest sie live aus Wix.

Offizielle Adresse: trendsverstehen.de (Weiterleitung auf die Wix-Adresse).
