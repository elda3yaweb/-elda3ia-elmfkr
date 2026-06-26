import { useEffect } from 'react';
import { useStore } from '../lib/store';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo() {
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    const s = settings;
    document.title = s.seoTitle || s.platformName;
    setMeta('name', 'description', s.seoDescription);
    setMeta('name', 'keywords', s.seoKeywords);
    setMeta('name', 'author', s.seoAuthor);
    // Open Graph
    setMeta('property', 'og:title', s.seoTitle || s.platformName);
    setMeta('property', 'og:description', s.seoDescription);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', s.seoImage || s.logoUrl);
    setMeta('property', 'og:site_name', s.platformName);
    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', s.seoTitle || s.platformName);
    setMeta('name', 'twitter:description', s.seoDescription);
    setMeta('name', 'twitter:image', s.seoImage || s.logoUrl);
    // theme color
    setMeta('name', 'theme-color', settings.lightPrimary);

    // favicon from logo if provided
    if (s.logoUrl && s.logoUrl !== '/logo.png') {
      let link = document.head.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (link) link.href = s.logoUrl;
    }
  }, [settings]);

  return null;
}
