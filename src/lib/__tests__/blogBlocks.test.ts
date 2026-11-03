import { describe, expect, it } from 'vitest';
import { parseBlock, parseInline } from '../blogBlocks';
import { getAllPosts } from '@/data/blogPosts';

describe('parseBlock', () => {
  it('turns numbered steps into an ordered list that keeps its start number', () => {
    const b = parseBlock('7. Identify the IFI.\n8. Add Futurpreneur.');
    expect(b).toEqual({ kind: 'list', ordered: true, start: 7, intro: '', items: ['Identify the IFI.', 'Add Futurpreneur.'] });
  });

  it('reads a list with no intro line without a stray dash', () => {
    const b = parseBlock('- **One.** first\n- Two');
    expect(b).toMatchObject({ kind: 'list', ordered: false, intro: '', items: ['**One.** first', 'Two'] });
  });

  it('keeps an intro line before a bullet list', () => {
    expect(parseBlock('Services:\n- Loans\n- Advice')).toMatchObject({ intro: 'Services:', items: ['Loans', 'Advice'] });
  });

  it('keeps the bold header pattern', () => {
    expect(parseBlock('**Who:** anyone')).toEqual({ kind: 'heading', title: 'Who', text: 'anyone' });
  });

  it('parses a pipe table', () => {
    const b = parseBlock('| Lender | Province |\n|---|---|\n| LRCC | MB |');
    expect(b).toEqual({ kind: 'table', header: ['Lender', 'Province'], rows: [['LRCC', 'MB']] });
  });

  it('joins a wrapped plain paragraph', () => {
    expect(parseBlock('one\ntwo')).toEqual({ kind: 'paragraph', text: 'one two' });
  });
});

describe('parseInline', () => {
  it('splits bold and links', () => {
    expect(parseInline('Call **your IFI** or see [NACCA](https://nacca.ca/).')).toEqual([
      { kind: 'text', text: 'Call ' },
      { kind: 'bold', text: 'your IFI' },
      { kind: 'text', text: ' or see ' },
      { kind: 'link', text: 'NACCA', url: 'https://nacca.ca/' },
      { kind: 'text', text: '.' },
    ]);
  });
});

describe('parseInline nesting', () => {
  it('keeps italic inside bold for a second pass', () => {
    expect(parseInline('**both *and* grants**')).toEqual([{ kind: 'bold', text: 'both *and* grants' }]);
    expect(parseInline('both *and* grants')[1]).toEqual({ kind: 'italic', text: 'and' });
  });
});

describe('every post body', () => {
  it('leaves no unparsed bold markers or leading dashes', () => {
    for (const post of getAllPosts()) {
      const paras = [post.introduction, ...post.sections.map((s) => s.content)].flatMap((t) => t.split('\n\n'));
      for (const p of paras) {
        const b = parseBlock(p);
        const texts = b.kind === 'list' ? [b.intro, ...b.items] : b.kind === 'table' ? [...b.header, ...b.rows.flat()] : [b.text];
        for (const t of texts) {
          const plain = parseInline(t).filter((r) => r.kind === 'text').map((r) => r.text).join('');
          expect(plain, `${post.slug}: ${t.slice(0, 60)}`).not.toMatch(/\*/);
        }
        if (b.kind === 'paragraph') expect(b.text, post.slug).not.toMatch(/^- /);
      }
    }
  });
});
