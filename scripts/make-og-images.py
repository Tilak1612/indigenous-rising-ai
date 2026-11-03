"""Generate the site's Open Graph images from the brand system only:
Warm Cream ground, the brand mark, Forest Green / Ink type, a Legacy Gold rule.
No photography, no cultural motifs, no flags. Usage: make-og.py <out_dir> <font.ttf|ttc> [font_index] [weight]

Brand font: Manrope (brand spec 108), bundled at scripts/fonts/Manrope[wght].ttf (licence: scripts/fonts/Manrope-OFL.txt)
under the SIL Open Font License. It is a variable font, so pass a weight:
  python3 scripts/make-og-images.py public "scripts/fonts/Manrope[wght].ttf" 0 800"""
import sys
from PIL import Image, ImageDraw, ImageFont
out, font_path = sys.argv[1], sys.argv[2]
idx = int(sys.argv[3]) if len(sys.argv) > 3 else 0
weight = int(sys.argv[4]) if len(sys.argv) > 4 else None
W, H = 1200, 630
CREAM, FOREST, GOLD, INK, MUTED = '#F5F0E8', '#124C3B', '#D79A27', '#111111', '#5B5F5A'
mark = Image.open('public/logo-icon.png').convert('RGBA')
def font(size, index=idx):
    try: f = ImageFont.truetype(font_path, size, index=index)
    except Exception: f = ImageFont.truetype(font_path, size)
    if weight is not None:
        try: f.set_variation_by_axes([weight])  # variable fonts only
        except Exception: pass
    return f
PAGES = {
 'og-home':        ('Funding · Planning · Training · Growth', 'Get funded.\nGrow your business.\nKeep your data.', 'For Indigenous entrepreneurs and Nations in Canada'),
 'og-pricing':     ('Pricing', 'Free to start.\nNo credit card.', 'Growth $49/mo · Nations & organizations: custom'),
 'og-compliance':  ('Canadian compliance', 'Data stored in Canada.\nOCAP®-aligned handling.', 'PIPEDA · CASL · export anytime'),
 'og-contact':     ('Contact', 'Talk to the team.', 'help@indigenousrising.ai'),
 'og-data-rights': ('Your data rights', 'Access, correct, export\nor delete your data.', 'Requests tracked with a reference number'),
 'og-privacy':     ('Privacy policy', 'What we collect, why,\nand where it lives.', 'Stored in Canada · export anytime'),
 'og-terms':       ('Terms of service', 'The agreement, in\nplain language.', 'indigenousrising.ai/terms'),
}
for name, (eyebrow, headline, sub) in PAGES.items():
    im = Image.new('RGB', (W, H), CREAM); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 18, H], fill=FOREST)                     # brand edge
    m = mark.resize((150, 150), Image.LANCZOS); im.paste(m, (80, 70), m)
    d.text((252, 88), 'Indigenous Rising', font=font(44), fill=FOREST)
    d.text((252, 142), eyebrow.upper(), font=font(26), fill=MUTED)
    lines = headline.split('\n'); size = 74 if len(lines) < 3 else 64
    y = 265 if len(lines) < 3 else 236
    for line in lines:
        d.text((80, y), line, font=font(size), fill=INK); y += size + 12
    d.rectangle([80, y + 14, 80 + 120, y + 20], fill=GOLD)        # gold rule
    d.text((80, y + 44), sub, font=font(30), fill=MUTED)
    d.text((80, H - 70), 'www.indigenousrising.ai', font=font(26), fill=FOREST)
    im.save(f'{out}/{name}.jpg', quality=90, optimize=True)
print('wrote', len(PAGES), 'images to', out)
