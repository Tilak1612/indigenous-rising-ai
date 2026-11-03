// 'YYYY-MM-DD' -> '28 September 2026'. Built from the parts, not new Date(str):
// a bare ISO date parses as UTC midnight and renders as the previous day across
// Canada.
export const formatPostDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

/** "Reviewed <date>" once a post has been substantively reviewed, else "Published <date>". */
export const postDateLabel = (post: { publishedAt: string; updatedAt: string }): string =>
  post.updatedAt > post.publishedAt ? `Reviewed ${formatPostDate(post.updatedAt)}` : `Published ${formatPostDate(post.publishedAt)}`;
