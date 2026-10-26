import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO_PAGES, getCanonicalServiceSlug, SITE_ORIGIN } from '../src/lib/seo.js';
import { rewriteSitemapOrigin } from '../src/lib/sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Sitemap & SEO Configuration', () => {
  it('robots.txt points to https://www.formant.cv/sitemap.xml and disallows private routes', () => {
    const robotsPath = path.join(rootDir, 'public', 'robots.txt');
    const content = fs.readFileSync(robotsPath, 'utf8');

    assert.ok(
      content.includes('Sitemap: https://www.formant.cv/sitemap.xml'),
      'robots.txt must declare https://www.formant.cv/sitemap.xml'
    );
    assert.ok(content.includes('Disallow: /admin'), 'robots.txt must disallow /admin');
    assert.ok(content.includes('Disallow: /dashboard'), 'robots.txt must disallow /dashboard');
    assert.ok(content.includes('Disallow: /assessment'), 'robots.txt must disallow /assessment');
    assert.ok(content.includes('Disallow: /service-selection'), 'robots.txt must disallow /service-selection');
  });

  it('sitemap.xml is valid XML and contains only production https://www.formant.cv URLs', () => {
    const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
    const content = fs.readFileSync(sitemapPath, 'utf8');

    assert.ok(content.startsWith('<?xml'), 'sitemap.xml must start with XML declaration');
    assert.ok(content.includes('<urlset'), 'sitemap.xml must contain <urlset>');

    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    let count = 0;

    while ((match = locRegex.exec(content)) !== null) {
      count++;
      const url = match[1];

      assert.ok(
        url.startsWith('https://www.formant.cv/'),
        `Sitemap URL "${url}" must start with production origin https://www.formant.cv/`
      );

      // Verify no legacy domains exist in sitemap
      assert.ok(
        !url.includes('careerlyst-three.vercel.app'),
        `Sitemap URL "${url}" must not contain old Vercel URL`
      );

      // Verify no sensitive internal routes exist in sitemap
      assert.ok(!url.includes('/admin'), `Sitemap must not expose admin URL: ${url}`);
      assert.ok(!url.includes('/dashboard'), `Sitemap must not expose dashboard URL: ${url}`);
      assert.ok(!url.includes('/login'), `Sitemap must not expose login URL: ${url}`);
      assert.ok(!url.includes('/signup'), `Sitemap must not expose signup URL: ${url}`);
    }

    assert.ok(count >= 10, `Expected at least 10 sitemap URLs, found ${count}`);
  });

  it('build sitemap preserves source lastmod values while rewriting only the site origin', () => {
    const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
    const source = fs.readFileSync(sitemapPath, 'utf8');
    const generated = rewriteSitemapOrigin(source, 'https://staging.example');

    assert.deepEqual(
      [...generated.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((match) => match[1]),
      [...source.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((match) => match[1]),
      'generated sitemap must preserve the source modification dates'
    );
    assert.equal((generated.match(/<loc>https:\/\/staging\.example\//g) || []).length,
      (source.match(/<loc>/g) || []).length,
      'every sitemap location must use the configured origin'
    );
    assert.doesNotMatch(generated, /https:\/\/www\.formant\.cv/);
    assert.equal(rewriteSitemapOrigin(source, SITE_ORIGIN), source);
  });

  it('describes Formant accurately and avoids unsupported SEO claims', () => {
    assert.equal(SEO_PAGES['/'].title, 'Formant — CV, LinkedIn & Interview Support');
    assert.match(SEO_PAGES['/'].description, /CV, LinkedIn or GitHub profile, portfolio, cover letter, or interview preparation/);
    assert.equal(SEO_PAGES['/services/resume'].title, 'CV & Resume Writing Support for Your Next Role | Formant');
    assert.match(SEO_PAGES['/about'].description, /organize and present their experience/);

    const allMetadata = Object.values(SEO_PAGES)
      .map(({ title, description }) => `${title} ${description}`)
      .join(' ');
    assert.doesNotMatch(
      allMetadata,
      /ATS optimization|executive-ready|measurable business outcomes|service guarantees|1-on-1 mock sessions|global privacy standards/i
    );
  });

  it('keeps the dedicated admin hostname root out of search results', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
    const adminRootNoIndex = vercelConfig.headers.find((rule) =>
      rule.source === '/' && rule.has?.some((condition) =>
        condition.type === 'host' && condition.value === 'admin.formant.cv'
      )
    );

    assert.ok(adminRootNoIndex, 'admin.formant.cv root must have a host-scoped header rule');
    assert.ok(adminRootNoIndex.headers.some((header) =>
      header.key === 'X-Robots-Tag' && /noindex/i.test(header.value)
    ));
  });

  it('uses canonical service slugs for public links and metadata', () => {
    assert.equal(getCanonicalServiceSlug('resume-cv'), 'resume');
    assert.equal(getCanonicalServiceSlug('cover-letter'), 'cover');
    assert.equal(getCanonicalServiceSlug('interview-preparation'), 'interview');
    assert.equal(getCanonicalServiceSlug('linkedin-profile'), 'linkedin');
    assert.equal(getCanonicalServiceSlug('github-profile'), 'github');
    assert.equal(getCanonicalServiceSlug('portfolio'), 'portfolio');

    const publicPages = fs.readFileSync(path.join(rootDir, 'src/pages/PublicPages.jsx'), 'utf8');
    assert.match(
      publicPages,
      /routeId:\s*getCanonicalServiceSlug\(service\.slug\s*\|\|\s*\(!supabase\s*\?\s*service\.id\s*:\s*''\)\)/,
      'About service links must normalize database slugs to canonical routes'
    );
  });
});
