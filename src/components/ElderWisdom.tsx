import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Feather } from 'lucide-react';

interface Quote {
  text: string;
  elder: string;
  community: string;
}

const quotes: Quote[] = [
  {
    text: "We do not inherit the earth from our ancestors; we borrow it from our children.",
    elder: "Elder Mary Thunderbird",
    community: "Anishinaabe Nation",
  },
  {
    text: "In every deliberation, we must consider the impact on the seventh generation.",
    elder: "Elder James Whitehorse",
    community: "Haudenosaunee Confederacy",
  },
  {
    text: "The strength of the wolf is the pack, and the strength of the pack is the wolf.",
    elder: "Elder Sarah Littlewing",
    community: "Cree Nation",
  },
  {
    text: "Listen to the wind, it talks. Listen to the silence, it speaks. Listen to your heart, it knows.",
    elder: "Elder Robert Running Bear",
    community: "Lakota Nation",
  },
  {
    text: "We are all connected; to each other, biologically. To the earth, chemically. To the rest of the universe atomically.",
    elder: "Elder Maria Crow Feather",
    community: "Blackfoot Nation",
  },
];

const ElderWisdom = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const currentQuote = quotes[currentIndex];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with beadwork-inspired pattern */}
      <div className="absolute inset-0 bg-secondary/95" />
      <div className="absolute inset-0 pattern-geometric opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Feather className="w-12 h-12 mx-auto mb-4 text-primary-foreground opacity-70" />
            <h2 className="font-display text-3xl md:text-4xl font-black text-primary-foreground mb-2">
              Dibaajimowin - Elder Wisdom
            </h2>
            <p className="text-primary-foreground/80">
              Traditional knowledge guiding modern innovation
            </p>
          </div>

          <Card className="relative bg-card/10 backdrop-blur-sm border-primary-foreground/20 p-8 md:p-12 shadow-elevated">
            <div
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
              }`}
            >
              <blockquote className="text-center space-y-6">
                <p className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground leading-relaxed italic">
                  "{currentQuote.text}"
                </p>
                <footer className="space-y-1">
                  <cite className="not-italic block font-bold text-lg text-primary-foreground">
                    — {currentQuote.elder}
                  </cite>
                  <p className="text-primary-foreground/70 text-sm">
                    {currentQuote.community}
                  </p>
                </footer>
              </blockquote>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                aria-label="Previous quote"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex gap-2">
                {quotes.map((_, index) => (
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
                        ? 'bg-primary-foreground w-8'
                        : 'bg-primary-foreground/40 hover:bg-primary-foreground/60'
                    }`}
                    aria-label={`Go to quote ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                aria-label="Next quote"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary"
            >
              Access Elder Knowledge Sessions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElderWisdom;
