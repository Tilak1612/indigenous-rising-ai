import { useParams, Link } from 'react-router-dom';
import { getFeatureBySlug } from '@/lib/features-data';
import FeatureCard from '@/components/FeatureCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FeatureDetail = () => {
  const { slug } = useParams();
  if (!slug) return null;

  const feature = getFeatureBySlug(slug);
  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Feature not found</h2>
          <p className="text-muted-foreground mt-2">Return to the <Link to="/">home page</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-black">{feature.title}</h1>
              <p className="text-sm text-primary/80 italic">{feature.titleTranslation}</p>

              <div className="text-muted-foreground leading-relaxed">
                {feature.description}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {feature.features.map((f, i) => (
                  <div key={i} className="p-4 bg-card/50 rounded-md">{f}</div>
                ))}
              </div>

              <div className="pt-6 flex gap-3">
                <Button asChild>
                  <Link to="/training">Explore related programs</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/">Back</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeatureDetail;
