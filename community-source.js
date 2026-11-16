// Both Follow and the shared search read the same public, published records.
export const COMMUNITY_APIS = ['https://os.sweetflyfilm.org/api/community'];

export async function readCommunityBoard() {
  for (const endpoint of COMMUNITY_APIS) {
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) continue;
      const data = await response.json();
      if (data.ok && Array.isArray(data.posts)) return { endpoint, posts: data.posts };
    } catch { /* Read fallback only; never retry a submission. */ }
  }
  throw new Error('The board could not load. Try again in a minute.');
}

export function communityCategory(value) {
  if (!value) return 'Seeking Crew';
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) value = parsed.join(', '); } catch { /* Plain text. */ }
  return value === 'Playground' ? 'Seeking Crew' : value;
}

export function communitySearchFields(post) {
  return {
    id: `board:${post.id}`, type: 'board', title: post.project_name,
    body: [post.description, post.roles_needed, post.shoot_dates, post.compensation, post.website].filter(Boolean).join(' '),
    people: [post.contact_name, post.contact_email].filter(Boolean),
    tags: [communityCategory(post.category)], source: post,
  };
}
