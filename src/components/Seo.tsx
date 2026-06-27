import { useEffect } from 'react';
import { useStore } from '../lib/store';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Dynamically applies SEO/meta from admin-controlled settings.
export default function Seo() {
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    if (settings.seoTitle) document.title = settings.seoTitle;
    setMeta('name', 'description', settings.seoDescription);
    setMeta('name', 'keywords', settings.seoKeywords);
    setMeta('name', 'author', settings.seoAuthor);
    setMeta('property', 'og:title', settings.seoTitle);
    setMeta('property', 'og:description', settings.seoDescription);
    setMeta('property', 'og:site_name', settings.platformName);
    if (settings.seoImage) setMeta('property', 'og:image', settings.seoImage);
    setMeta('name', 'twitter:title', settings.seoTitle);
    setMeta('name', 'twitter:description', settings.seoDescription);
    if (settings.seoImage) setMeta('name', 'twitter:image', settings.seoImage);
  }, [settings]);

  return null;
}
