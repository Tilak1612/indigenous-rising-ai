import { Card, CardContent } from '@/components/ui/card';
import { Compass, FileText, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Honest version. We do NOT display fabricated testimonials, named people, fake
// headshots, or invented metrics ($ secured, jobs created, graduation rates).
// Verified customer stories live on /success-stories and are added only with
// permission. This section presents what the platform actually does.

const TestimonialsSection = () => {
  const pillars = [
    {
      icon: Compass,
      title: 'Find the right funding',
      description:
        'Match against grants, loans, and programs relevant to Indigenous-owned businesses across Canada.',
    },
    {
      icon: FileText,
      title: 'Build your business plan',
      description:
        'Structured tools to draft, refine, and export a plan you can take to lenders and funders.',
    },
    {
      icon: GraduationCap,
      title: 'Grow your skills',
      description:
        'Training focused on practical business skills, AI, and data sovereignty for your community.',
    },
    {
      icon: ShieldCheck,
      title: 'Keep ownership of your data',
      description:
        'Built around OCAP® — your community owns its data, stored in Canada, exportable any time.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-subtle" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Built for Indigenous business growth
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            One platform for funding, planning, training, and growth — designed around your
            community&apos;s data sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.title}
                className="group hover:shadow-elevated transition-spring bg-card/95 backdrop-blur-sm border-border/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-foreground">{pillar.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            to="/success-stories"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted/50 transition-colors"
          >
            Read success stories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
