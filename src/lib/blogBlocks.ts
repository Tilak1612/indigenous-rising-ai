/**
 * Turns one blog paragraph (text between blank lines) into a renderable block.
 *
 * Post bodies are lightweight markdown. Before this module the page only knew
 * "**Header:** rest" and "intro\n- item" paragraphs, so numbered steps ran
 * together as one paragraph, a list with no intro line showed a literal "- ",
 * and **bold** showed its asterisks. Kept pure so it can be tested without
 * rendering.
 */
export type BlogBlock =
  | { kind: 'heading'; title: string; text: string }
  | { kind: 'list'; ordered: boolean; start: number; intro: string; items: string[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'paragraph'; text: string };

const BULLET = /^- /;
const NUMBERED = /^(\d+)\. /;
const isTableLine = (l: string) => l.startsWith('|') && l.endsWith('|');
const cells = (l: string) => l.slice(1, -1).split('|').map((c) => c.trim());

export function parseBlock(para: string): BlogBlock {
  const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length >= 2 && lines.every(isTableLine) && /^\|[\s:|-]+\|$/.test(lines[1])) {
    return { kind: 'table', header: cells(lines[0]), rows: lines.slice(2).map(cells) };
  }

  const firstItem = lines.findIndex((l) => BULLET.test(l) || NUMBERED.test(l));
  if (firstItem !== -1 && lines.slice(firstItem).every((l) => BULLET.test(l) || NUMBERED.test(l))) {
    const items = lines.slice(firstItem);
    const ordered = NUMBERED.test(items[0]);
    return {
      kind: 'list',
      ordered,
      start: ordered ? Number(items[0].match(NUMBERED)![1]) : 1,
      intro: lines.slice(0, firstItem).join(' '),
      items: items.map((l) => l.replace(ordered ? NUMBERED : BULLET, '')),
    };
  }

  if (para.startsWith('**') && para.includes(':**')) {
    const [header, ...rest] = para.split(':**');
    return { kind: 'heading', title: header.replace(/\*\*/g, ''), text: rest.join(':**').trim() };
  }

  return { kind: 'paragraph', text: lines.join(' ') };
}

/**
 * Splits text into plain, bold, italic and link runs. A bold run's text may
 * itself hold *italic*, so callers parse it again when rendering.
 */
export type InlineRun =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'link'; text: string; url: string };

const INLINE_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)|\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g;

export function parseInline(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) runs.push({ kind: 'text', text: text.slice(last, m.index) });
    if (m[3] !== undefined) runs.push({ kind: 'bold', text: m[3] });
    else if (m[4] !== undefined) runs.push({ kind: 'italic', text: m[4] });
    else runs.push({ kind: 'link', text: m[1], url: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push({ kind: 'text', text: text.slice(last) });
  return runs;
}
