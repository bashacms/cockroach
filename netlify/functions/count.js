// Returns a live colony count: 247 base + current Netlify Forms submissions.
// Reads NETLIFY_API_TOKEN (set as env var on the site) and SITE_ID
// (auto-injected by Netlify into every function runtime).

const BASE_COUNT = 247;

export const handler = async () => {
  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.SITE_ID;

  const fallback = (count) => ({
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30, s-maxage=30',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ count }),
  });

  if (!token || !siteId) return fallback(BASE_COUNT);

  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return fallback(BASE_COUNT);
    const forms = await res.json();
    const subscribe = Array.isArray(forms) && forms.find((f) => f.name === 'subscribe');
    const submissions = subscribe?.submission_count ?? 0;
    return fallback(BASE_COUNT + submissions);
  } catch {
    return fallback(BASE_COUNT);
  }
};
