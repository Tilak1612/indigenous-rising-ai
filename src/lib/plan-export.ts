/**
 * Business plan export.
 *
 * The Export menu in BusinessPlanner used to be:
 *
 *   const handleExport = (format) => {
 *     toast.success(`Exporting as ${format.toUpperCase()}...`);
 *     // Implement actual export logic here
 *   };
 *
 * A success toast and nothing else. The user was told the export worked, got no
 * file, and had no way to tell the difference — worse than a disabled button,
 * because it looks like it succeeded. /plan advertises "PDF Export" on the
 * marketing page, so this was a promise made twice and kept neither time.
 *
 * These are pure string builders so the output can be asserted without a DOM.
 * The browser-side plumbing (Blob, download, print) lives in the component.
 *
 * Plan answers are contenteditable HTML, already sanitized by DOMPurify on the
 * way in. They are re-escaped here for the plain-text path and passed through
 * for the HTML paths, which are the same markup the editor already renders.
 */

export type PlanStep = { id: string; title: string };

/** Turn one answer's editor HTML into readable plain text. */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  return html
    // Block boundaries become newlines before tags are stripped, or every
    // paragraph runs together into one line.
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    // Entities the editor commonly emits.
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Sections that actually have content. An empty plan exports as an empty plan. */
export function filledSections(
  steps: PlanStep[],
  answers: Record<string, string>,
): Array<{ title: string; html: string; text: string }> {
  const out: Array<{ title: string; html: string; text: string }> = [];
  for (const step of steps) {
    const html = answers[step.id] ?? '';
    const text = htmlToPlainText(html);
    if (text.length === 0) continue;
    out.push({ title: step.title, html, text });
  }
  return out;
}

/**
 * A standalone HTML document. Used for the Word download and, via print(), for
 * PDF — the browser's own "Save as PDF" rather than a bundled PDF library.
 */
export function planToHtmlDocument(
  title: string,
  steps: PlanStep[],
  answers: Record<string, string>,
  exportedOn: Date = new Date(),
): string {
  const sections = filledSections(steps, answers);
  const date = exportedOn.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const body = sections.length
    ? sections
        .map((s) => '<h2>' + escapeHtml(s.title) + '</h2>\n' + s.html)
        .join('\n')
    : '<p class="empty">This plan does not have any completed sections yet.</p>';

  return [
    '<!DOCTYPE html>',
    '<html lang="en"><head><meta charset="utf-8">',
    '<title>' + escapeHtml(title) + '</title>',
    '<style>',
    'body{font-family:Georgia,"Times New Roman",serif;max-width:46em;margin:3em auto;padding:0 1.5em;line-height:1.6;color:#111}',
    'h1{font-size:1.9em;margin-bottom:.15em}',
    'h2{font-size:1.25em;margin-top:2em;border-bottom:1px solid #ddd;padding-bottom:.3em}',
    '.meta{color:#555;font-size:.9em;margin-top:0}',
    '.empty{color:#555;font-style:italic}',
    '@media print{body{margin:0;max-width:none}}',
    '</style></head><body>',
    '<h1>' + escapeHtml(title) + '</h1>',
    '<p class="meta">Exported from Indigenous Rising AI on ' + escapeHtml(date) + '</p>',
    body,
    '</body></html>',
  ].join('\n');
}

/**
 * Plain text, for pasting into a funder's application form. Most application
 * portals are textareas that strip markup, which is why this exists separately
 * from the HTML export.
 */
export function planToPlainText(
  title: string,
  steps: PlanStep[],
  answers: Record<string, string>,
  exportedOn: Date = new Date(),
): string {
  const sections = filledSections(steps, answers);
  const date = exportedOn.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const parts = [title, '='.repeat(title.length), 'Exported from Indigenous Rising AI on ' + date, ''];
  if (!sections.length) {
    parts.push('This plan does not have any completed sections yet.');
  } else {
    for (const s of sections) {
      parts.push(s.title, '-'.repeat(s.title.length), s.text, '');
    }
  }
  return parts.join('\n').trimEnd() + '\n';
}

/** A filesystem-safe filename stem. */
export function exportFilename(title: string, ext: string, on: Date = new Date()): string {
  const stem =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'business-plan';
  const d = on.toISOString().slice(0, 10);
  return stem + '-' + d + '.' + ext;
}
