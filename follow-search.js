/* Shared text search for public Follow content. Sources supply the same record
   shape; newsletter/article adapters can join without adding another search UI. */
export function normalizeSearchText(value) {
  return String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLocaleLowerCase('en-US').replace(/[^\p{L}\p{N}@]+/gu, ' ').trim();
}

export function createSearchRecord({ id, type, title = '', body = '', people = [], tags = [], source }) {
  return { id, type, title, tags, source,
    titleText: normalizeSearchText(title), peopleText: normalizeSearchText(people.join(' ')),
    tagsText: normalizeSearchText(tags.join(' ')), bodyText: normalizeSearchText(body),
    searchText: normalizeSearchText([title, body, ...people, ...tags].join(' ')) };
}

// One missing/extra/substituted letter or an adjacent transposition. Short words
// must match exactly so a name search does not become a list of unrelated pages.
function nearWord(a, b) {
  if (a.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const different = [...a].map((c, i) => c === b[i] ? -1 : i).filter(i => i >= 0);
    return different.length === 1 || (different.length === 2 && different[1] === different[0] + 1
      && a[different[0]] === b[different[1]] && a[different[1]] === b[different[0]]);
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0; while (i < short.length && short[i] === long[i]) i++;
  return short.slice(i) === long.slice(i + 1);
}

export function searchRecords(records, query = '', { type = '', tag = '', ranked = false } = {}) {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  const matches = records.filter(record => (!type || record.type === type)
    && (!tag || record.tags.includes(tag))
    && terms.every(term => record.searchText.includes(term)
      || (ranked && record.searchText.split(' ').some(word => nearWord(term, word)))));
  if (!ranked || !terms.length) return matches;
  const phrase = terms.join(' ');
  const score = record => {
    const title = record.titleText || '', people = record.peopleText || '', tags = record.tagsText || '';
    return (title === phrase ? 160 : title.includes(phrase) ? 75 : 0)
      + (people.includes(phrase) ? 55 : 0)
      + terms.reduce((sum, term) => sum + (title.includes(term) ? 20 : 0)
        + (people.includes(term) ? 12 : 0) + (tags.includes(term) ? (record.type === 'page' ? 28 : 8) : 0)
        + (record.searchText.includes(term) ? 3 : 0), 0)
      + (record.type === 'person' ? 8 : 0);
  };
  return matches.sort((a, b) => score(b) - score(a));
}
