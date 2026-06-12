import FeatureCard from './FeatureCard';
import { features } from '@/lib/features-data';
import UpgradeModal from './UpgradeModal';

const FeaturesSection = () => {

  return (
    <section id="features" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Comprehensive Support for
            <span className="block gradient-earth bg-clip-text text-transparent">
              Indigenous Innovation
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Miigwech - Our platform integrates traditional Indigenous wisdom with cutting-edge AI technology, 
            respecting cultural values while accelerating business success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FeatureCard {...feature} to={`/features/${feature.slug}`} onClick={() => {}} premium={feature.premium} />
              {feature.premium && (
                <div className="mt-2">
                  <UpgradeModal triggerText="Upgrade to unlock" triggerSize="sm" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cultural acknowledgment */}
        <div className="mt-20 text-center space-y-4 p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-natural">
          <p className="text-sm text-muted-foreground italic">
            "We acknowledge that we are on the traditional territories of Indigenous peoples and commit to honoring Indigenous data sovereignty principles in all our operations."
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground/70">
            <span>OCAP® Principles</span>
            <span>•</span>
            <span>Truth and Reconciliation</span>
            <span>•</span>
            <span>Cultural Competency</span>
            <span>•</span>
            <span>Community Partnership</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;