import { createSearchRecord, searchRecords, normalizeSearchText } from './follow-search.js?v=20261108-discovery';
import { readCommunityBoard, communitySearchFields } from './community-source.js?v=20261101-header-search';

export function filmSearchRecords(document, origin) {
  return [...document.querySelectorAll('.sf-project-card')].flatMap(card => {
    const url = new URL(card.getAttribute('href'), origin);
    if (url.origin !== origin || !url.pathname.startsWith('/watch/')) return [];
    return [createSearchRecord({ id: `film:${url.pathname}`, type: 'film',
      title: card.dataset.title || card.querySelector('h2')?.textContent || 'Film',
      body: card.textContent, tags: [card.dataset.cat, card.dataset.year].filter(Boolean),
      source: { url: url.pathname, description: card.querySelector('.sf-project-desc')?.textContent || '' },
    })];
  });
}

const PAGES = [
  { id: 'hire', title: 'Hire Us', url: '/hire.html', description: 'Film production and script coverage. Tell us about your project.', tags: ['production', 'produce', 'producer', 'filmmaking', 'hire', 'crew', 'shoot', 'video', 'services', 'work with us'] },
  { id: 'coverage', title: 'Script Coverage', url: '/coverage.html', description: 'Feedback and development for your screenplay.', tags: ['writing', 'writer', 'written', 'screenplay', 'script', 'coverage', 'development', 'feedback'] },
  { id: 'reel', title: 'Studio Reel', url: '/four-ways#studio-reel', description: 'Watch the Sweet Flypaper studio reel.', tags: ['reel', 'showreel', 'demo', 'sizzle', 'video', 'production', 'portfolio'] },
  { id: 'about', title: 'About Sweet Flypaper', url: '/info.html', description: 'Our people, mission and story.', tags: ['about', 'info', 'team', 'people', 'founders', 'profile', 'biography', 'contact'] },
  { id: 'watch', title: 'Watch Our Films', url: '/watch.html', description: 'Features, shorts and series from Sweet Flypaper.', tags: ['watch', 'films', 'movies', 'series', 'trailers', 'portfolio'] },
  { id: 'follow', title: 'Follow · Community Board', url: '/follow.html', description: 'Published posts, crew calls, events and community news.', tags: ['follow', 'community', 'posts', 'jobs', 'cast', 'crew', 'news', 'newsletter', 'fly paper'] },
  { id: 'rent', title: 'Rent Gear · SweetFly Shop', url: 'https://rent.sweetflyfilm.com/', description: 'Camera, lighting, grip and basecamp rentals.', tags: ['rent', 'rental', 'rentals', 'equipment', 'gear', 'camera', 'lighting', 'grip', 'basecamp', 'shop'] },
];

export function profileAnchor(name) {
  return `person-${normalizeSearchText(name).replace(/\s+/g, '-')}`;
}

export function profileSearchRecords(document) {
  return [...document.querySelectorAll('.sf-founder-card, .sf-advisor-card')].flatMap(card => {
    const name = card.querySelector('.sf-founder-name, .sf-advisor-name')?.textContent?.trim();
    if (!name) return [];
    const description = [...card.querySelectorAll('.sf-founder-role, .sf-founder-bio, .sf-advisor-role')]
      .map(node => node.textContent.trim()).join(' · ');
    return [createSearchRecord({ id: `person:${profileAnchor(name)}`, type: 'person', title: name,
      body: description, people: [name], tags: ['person', 'profile', 'bio', 'team'],
      source: { url: `/info.html#${profileAnchor(name)}`, description } })];
  });
}

function pageText(document) {
  const content = (document.querySelector?.('main') || document.body)?.cloneNode(true);
  if (!content) return '';
  content.querySelectorAll('script, style, nav, footer, form, dialog, #footer-placeholder, #sfn-box, #sfn-btn')
    .forEach(node => node.remove());
  return content.textContent.replace(/\s+/g, ' ').trim();
}

async function readPage(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Page unavailable');
  return new DOMParser().parseFromString(await response.text(), 'text/html');
}

export async function loadSiteSearchIndex() {
  // Useful destinations remain searchable even when a content source is down.
  const records = PAGES.map(page => createSearchRecord({ id: `page:${page.id}`, type: 'page',
    title: page.title, body: page.description, tags: page.tags, source: page }));
  const unavailable = [];
  const sources = await Promise.allSettled([
    readPage('/watch.html').then(async document => {
      const films = filmSearchRecords(document, location.origin);
      return Promise.all(films.map(async film => {
        try {
          const detail = await readPage(film.source.url);
          const creditItems = [...detail.querySelectorAll('.sidebar-item, .project-meta-cell')]
            .map(node => [...node.children].map(child => child.textContent.trim()).join(': '));
          const credits = creditItems.join(' · ');
          return createSearchRecord({ ...film, body: `${film.searchText} ${pageText(detail)}`,
            people: [credits], tags: [...film.tags, 'film', 'credits', ...(/written by/i.test(credits) ? ['writing', 'writer', 'screenplay'] : [])],
            source: { ...film.source, credits: creditItems,
              description: [...creditItems].sort((a, b) => Number(/^Written By/i.test(b)) - Number(/^Written By/i.test(a)))
                .join(' · ').replace(/\s+/g, ' ').trim().slice(0, 240) || film.source.description } });
        } catch { unavailable.push('some film credits'); return film; }
      }));
    }),
    readCommunityBoard().then(({ posts }) => posts.map(post => {
      const fields = communitySearchFields(post);
      return createSearchRecord({ ...fields, source: { ...post,
        url: `/follow.html#post-${encodeURIComponent(post.id)}`,
        description: [post.contact_name && `By ${post.contact_name}`, post.description].filter(Boolean).join(' · ') } });
    })),
    readPage('/info.html').then(profileSearchRecords),
    readPage('/hire.html').then(document => [createSearchRecord({
      id: 'page:hire', type: 'page', title: PAGES[0].title, tags: PAGES[0].tags,
      body: pageText(document), source: PAGES[0],
    })]),
  ]);
  sources.forEach((result, index) => {
    if (result.status === 'rejected') unavailable.push(['films', 'community', 'people', 'service details'][index]);
    else for (const record of result.value) {
      const existing = records.findIndex(old => old.id === record.id);
      if (existing >= 0) records[existing] = record; else records.push(record);
    }
  });
  return { records, unavailable: [...new Set(unavailable)] };
}

export function resultDescription(record, query) {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  const credits = (record.source.credits || []).filter(credit =>
    terms.every(term => normalizeSearchText(credit).includes(term)))
    .sort((a, b) => Number(/^Written By/i.test(b)) - Number(/^Written By/i.test(a)));
  return credits.length ? credits.join(' · ') : record.source.description;
}

export function initSiteSearch() {
  const dialog = document.getElementById('site-search-dialog');
  const opener = document.querySelector('.sf-nav-search');
  if (!dialog || !opener || dialog.dataset.ready) return;
  dialog.dataset.ready = 'true';
  const input = document.getElementById('site-search-query');
  const results = document.getElementById('site-search-results');
  const status = document.getElementById('site-search-status');
  let index;
  let loading;

  const element = (tag, text, className) => {
    const node = document.createElement(tag); node.textContent = text || '';
    if (className) node.className = className;
    return node;
  };
  const render = () => {
    results.replaceChildren();
    if (!index) { status.textContent = 'Loading people, films, posts and services'; return; }
    if (!index.records.length && index.unavailable.length) {
      status.textContent = 'Search is unavailable right now. Close and reopen to try again.'; return;
    }
    const warning = index.unavailable.length ? ` ${index.unavailable.join(' and ')} results are currently unavailable.` : '';
    if (!input.value.trim()) { status.textContent = `Search people, credits, posts, services and the reel.${warning}`; return; }
    const matches = searchRecords(index.records, input.value, { ranked: true });
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}.${warning}` : `No matches. Try another name or keyword.${warning}`;
    results.replaceChildren(...matches.map(record => {
      const item = element('li');
      const link = element('a', '', 'sf-site-search-result');
      link.href = record.source.url;
      link.append(element('small', ({ film: 'Film · Credits', person: 'Profile', board: 'Community Board', page: 'Explore' })[record.type] || 'Explore'), element('strong', record.title),
        element('p', resultDescription(record, input.value)));
      // Same-page post links must release the modal before scrolling the board.
      link.addEventListener('click', () => dialog.close());
      item.append(link); return item;
    }));
  };

  opener.addEventListener('click', async () => {
    if (dialog.open) return;
    dialog.showModal(); document.body.classList.add('sf-search-open');
    opener.setAttribute('aria-expanded', 'true'); input.focus(); render();
    if (!index || index.unavailable.length) {
      loading ||= loadSiteSearchIndex().then(value => { index = value; }).finally(() => { loading = undefined; });
      await loading; render();
    }
  });
  dialog.querySelector('[data-close-search]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-clear-search]').addEventListener('click', () => { input.value = ''; render(); input.focus(); });
  dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); render(); });
  input.addEventListener('input', render);
  dialog.addEventListener('close', () => {
    document.body.classList.remove('sf-search-open'); opener.setAttribute('aria-expanded', 'false'); opener.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}
