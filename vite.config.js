import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SEO_PAGES, SITE_ORIGIN, BRAND_IMAGE, getStructuredData } from './src/lib/seo.js'
import { rewriteSitemapOrigin } from './src/lib/sitemap.js'

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function replaceMeta(html, id, property, value) {
  const escaped = escapeAttribute(value);
  const pattern = new RegExp(`<meta id="${id}"[^>]*>`);
  return html.replace(pattern, `<meta id="${id}" ${property}="${escaped}"/>`);
}

function getFallbackBody(path, metadata) {
  const title = metadata?.title?.split('|')[0]?.split('—')[1]?.trim() || metadata?.title?.split('|')[0]?.trim() || 'Formant Career Services';
  return `<div id="root"><main style="max-width:840px;margin:40px auto;padding:0 24px;font-family:sans-serif;line-height:1.6"><header style="margin-bottom:32px"><a href="/" style="font-weight:700;text-decoration:none;color:inherit;font-size:20px">Formant</a><nav style="margin-top:12px;display:flex;gap:16px;flex-wrap:wrap"><a href="/services">Services</a><a href="/showcase">Showcase</a><a href="/pricing">Pricing</a><a href="/about">About</a><a href="/contact">Contact</a></nav></header><article><h1>${escapeAttribute(title)}</h1><p style="font-size:18px;color:#444">${escapeAttribute(metadata?.description || '')}</p></article><footer style="margin-top:64px;padding-top:24px;border-top:1px solid #ddd;font-size:14px;color:#666"><p>© 2026 Formant. Professional career documents and interview preparation.</p><nav style="display:flex;gap:12px"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refund">Refunds</a></nav></footer></main></div>`;
}

function staticSeoPages() {
  return {
    name: 'formant-static-seo-pages',
    apply: 'build',
    writeBundle(outputOptions) {
      const outputDirectory = resolve(outputOptions.dir || 'dist');
      const template = readFileSync(resolve(outputDirectory, 'index.html'), 'utf8');

      for (const [path, metadata] of Object.entries(SEO_PAGES)) {
        const canonicalUrl = `${SITE_ORIGIN}${path === '/' ? '/' : path}`;
        const structuredData = getStructuredData(path);

        let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttribute(metadata.title)}</title>`);
        html = replaceMeta(html, 'seo-description', 'name="description" content', metadata.description);
        html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow"/>');
        html = html.replace(/<link id="seo-canonical"[^>]*>/, `<link id="seo-canonical" rel="canonical" href="${canonicalUrl}"/>`);
        html = replaceMeta(html, 'seo-og-title', 'property="og:title" content', metadata.title);
        html = replaceMeta(html, 'seo-og-description', 'property="og:description" content', metadata.description);
        html = replaceMeta(html, 'seo-og-url', 'property="og:url" content', canonicalUrl);
        html = replaceMeta(html, 'seo-og-image', 'property="og:image" content', BRAND_IMAGE);
        html = replaceMeta(html, 'seo-og-image-alt', 'property="og:image:alt" content', 'Formant career preparation');
        html = replaceMeta(html, 'seo-twitter-title', 'name="twitter:title" content', metadata.title);
        html = replaceMeta(html, 'seo-twitter-description', 'name="twitter:description" content', metadata.description);
        html = replaceMeta(html, 'seo-twitter-image', 'name="twitter:image" content', BRAND_IMAGE);

        if (structuredData) {
          const jsonLdEscaped = JSON.stringify(structuredData);
          html = html.replace(/<script id="seo-structured-data"[^>]*>[\s\S]*?<\/script>/, `<script id="seo-structured-data" type="application/ld+json">${jsonLdEscaped}</script>`);
        }

        // Inject semantic fallback HTML for search engine crawlers without JS
        html = html.replace('<div id="root"></div>', getFallbackBody(path, metadata));

        if (path === '/') {
          // Update dist/index.html directly
          writeFileSync(resolve(outputDirectory, 'index.html'), html);
        } else {
          const fileName = `seo/${path.slice(1).replaceAll('/', '-')}.html`;
          const target = resolve(outputDirectory, fileName);
          mkdirSync(resolve(target, '..'), { recursive: true });
          writeFileSync(target, html);
        }
      }

      // public/sitemap.xml is the source of truth for route inclusion and lastmod dates.
      const sitemapSource = readFileSync(resolve('public/sitemap.xml'), 'utf8');
      const sitemapXml = rewriteSitemapOrigin(sitemapSource, SITE_ORIGIN);
      writeFileSync(resolve(outputDirectory, 'sitemap.xml'), sitemapXml);

      const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /auth/\nDisallow: /forgot-password\nDisallow: /reset-password\nDisallow: /assessment\nDisallow: /service-selection\nDisallow: /dashboard/\nDisallow: /dashboard\nDisallow: /admin/\nDisallow: /admin\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
      writeFileSync(resolve(outputDirectory, 'robots.txt'), robotsTxt);
    }
  };
}

export default defineConfig({
  plugins: [react(), staticSeoPages()],

  server: {
    allowedHosts: [
      '.trycloudflare.com',
    ],
  },
})
