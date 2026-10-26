export function rewriteSitemapOrigin(sitemapXml, siteOrigin) {
  const origin = String(siteOrigin || '').replace(/\/+$/, '');
  if (!/^https:\/\//i.test(origin)) {
    throw new Error('Sitemap origin must use HTTPS.');
  }

  return String(sitemapXml).replace(/<loc>https?:\/\/[^<]+<\/loc>/g, (locationTag) => {
    const location = locationTag.slice('<loc>'.length, -'</loc>'.length);
    const url = new URL(location);
    return `<loc>${origin}${url.pathname}${url.search}${url.hash}</loc>`;
  });
}
