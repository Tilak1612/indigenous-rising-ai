import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Feather } from 'lucide-react';

// Our own data-sovereignty principles, stated in the platform's voice. We do
// NOT attribute words to named Elders or specific Nations — fabricated quotes
// and pan-Indigenous attributions are not acceptable. These are the OCAP®
// principles (Ownership, Control, Access, Possession) as we apply them.
interface Principle {
  text: string;
  label: string;
}

const principles: Principle[] = [
  {
    text: "Your community owns its data. We are the custodian — never the owner.",
    label: "Ownership",
  },
  {
    text: "You decide who can see and use your information, always with clear, granular consent.",
    label: "Control",
  },
  {
    text: "You can access and export everything we hold about you, at any time.",
    label: "Access",
  },
  {
    text: "Your data is physically stored in Canada. Possession stays with you and your community.",
    label: "Possession",
  },
];

const ElderWisdom = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % principles.length);
        setIsAnimating(false);
      }, 300);
    }
  }, [isAnimating]);

  const handlePrev = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + principles.length) % principles.length);
        setIsAnimating(false);
      }, 300);
    }
  }, [isAnimating]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [handleNext]);

  const currentPrinciple = principles[currentIndex];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with beadwork-inspired pattern */}
      <div className="absolute inset-0 bg-success" />
      <div className="absolute inset-0 pattern-geometric opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Feather className="w-12 h-12 mx-auto mb-4 text-white opacity-70" />
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-2">
              Built on data sovereignty
            </h2>
            <p className="text-white/80">
              The OCAP® principles guide everything we build
            </p>
          </div>

          <Card className="relative bg-white/10 backdrop-blur-sm border-white/20 p-8 md:p-12 shadow-elevated">
            <div
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
              }`}
            >
              <blockquote className="text-center space-y-6">
                <p className="font-display text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                  {currentPrinciple.text}
                </p>
                <footer>
                  <cite className="not-italic block font-bold text-lg text-white tracking-wide uppercase">
                    {currentPrinciple.label}
                  </cite>
                </footer>
              </blockquote>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="text-white hover:bg-white/10"
                aria-label="Previous principle"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex gap-2">
                {principles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentIndex(index);
                        setIsAnimating(false);
                      }, 300);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-white w-8'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to principle ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="text-white hover:bg-white/10"
                aria-label="Next principle"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-success"
            >
              <Link to="/compliance">
                Learn how we protect your data
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElderWisdom;
