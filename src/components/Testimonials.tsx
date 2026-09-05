import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FLAGS } from '@/lib/flags';
import { listPublishedTestimonials, type Testimonial } from '@/lib/testimonials';
import { Quote } from 'lucide-react';

/**
 * Consent-gated testimonial section.
 *
 * Renders NOTHING when there is no approved, consented, published content —
 * no skeleton, no placeholder, no "coming soon". An empty testimonial
 * section is worse than no section, and a fabricated one is worse still.
 * That is the whole point: this can be mounted on the homepage today, while
 * zero real testimonials exist, and it will simply not appear.
 *
 * A failed load is also silent for the same reason: a visitor should never
 * see a broken social-proof block. The error goes to the console.
 */
export const Testimonials: React.FC<{ heading?: string }> = ({
  heading = 'What our customers say',
}) => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!FLAGS.testimonials) { setLoaded(true); return; }
    try {
      setItems(await listPublishedTestimonials());
    } catch (err) {
      console.error('[Testimonials] load failed:', err);
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Nothing to show, or not enabled: render nothing at all.
  if (!FLAGS.testimonials || !loaded || items.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="py-16">
      <div className="container mx-auto px-4">
        <h2 id="testimonials-heading" className="mb-8 text-center text-3xl font-bold">
          {heading}
        </h2>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <li key={t.id}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 pt-6">
                  <Quote className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <blockquote className="flex-1 text-muted-foreground">
                    {/* The exact approved wording. Never edited for style. */}
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  {t.verified_metric && (
                    <p className="text-sm font-medium text-foreground">{t.verified_metric}</p>
                  )}

                  <figcaption className="flex items-center gap-3 border-t pt-4">
                    {t.photo_or_logo_url && (
                      <img
                        src={t.photo_or_logo_url}
                        alt=""
                        aria-hidden="true"
                        width={40}
                        height={40}
                        loading="lazy"
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{t.customer_name}</span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {[t.role, t.company, t.location].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </figcaption>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Testimonials;
