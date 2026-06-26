// Fetch metadata (title, description, thumbnail, embeddable url) from a link.

export interface LinkMeta {
  title: string;
  description: string;
  thumbnail: string;
  embedUrl: string; // for videos
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function extractDriveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
  return m ? m[1] : null;
}

// Convert any video link to an embeddable URL
export function toEmbedUrl(url: string): string {
  const yt = extractYouTubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}`;
  const vm = extractVimeoId(url);
  if (vm) return `https://player.vimeo.com/video/${vm}`;
  const drive = extractDriveId(url);
  if (drive) return `https://drive.google.com/file/d/${drive}/preview`;
  return url;
}

// Try to fetch rich metadata. Uses YouTube oEmbed (no key) then a CORS-friendly reader.
export async function fetchLinkMeta(url: string): Promise<LinkMeta> {
  const clean = url.trim();
  const meta: LinkMeta = { title: '', description: '', thumbnail: '', embedUrl: toEmbedUrl(clean) };

  // YouTube → oEmbed (reliable, CORS-enabled)
  const yt = extractYouTubeId(clean);
  if (yt) {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${yt}&format=json`);
      if (res.ok) {
        const j = await res.json();
        meta.title = j.title || '';
        meta.description = j.author_name ? `قناة: ${j.author_name}` : '';
        meta.thumbnail = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
        return meta;
      }
    } catch { /* fall through */ }
    meta.thumbnail = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
  }

  // Vimeo → oEmbed
  const vm = extractVimeoId(clean);
  if (vm) {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const j = await res.json();
        meta.title = j.title || '';
        meta.description = j.description || (j.author_name ? `بواسطة: ${j.author_name}` : '');
        meta.thumbnail = j.thumbnail_url || '';
        return meta;
      }
    } catch { /* fall through */ }
  }

  // Generic page → read HTML via a public reader proxy and parse OpenGraph tags
  try {
    const proxied = `https://r.jina.ai/${clean}`;
    const res = await fetch(proxied);
    if (res.ok) {
      const text = await res.text();
      // jina returns readable text; first non-empty line is usually the title
      const titleLine = text.split('\n').map((l) => l.trim()).find((l) => l.length > 0);
      if (titleLine) meta.title = titleLine.replace(/^#+\s*/, '').slice(0, 120);
      const descLine = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 30)[1];
      if (descLine) meta.description = descLine.slice(0, 200);
      return meta;
    }
  } catch { /* ignore */ }

  // last resort: derive a title from the URL
  try {
    const host = new URL(clean).hostname.replace('www.', '');
    meta.title = host;
  } catch { /* ignore */ }
  return meta;
}
