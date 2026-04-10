import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Rocket, TrendingUp, DollarSign, X } from 'lucide-react';

interface QuizOption {
  id: string;
  title: string;
  icon: React.ElementType;
  targetSection: string;
}

const quizOptions: QuizOption[] = [
  {
    id: 'starting',
    title: 'Starting a Business',
    icon: Rocket,
    targetSection: 'training',
  },
  {
    id: 'growing',
    title: 'Growing Existing Business',
    icon: TrendingUp,
    targetSection: 'impact',
  },
  {
    id: 'funding',
    title: 'Seeking Funding',
    icon: DollarSign,
    targetSection: 'funding',
  },
];

interface InteractiveQuizProps {
  onClose?: () => void;
}

const InteractiveQuiz = ({ onClose }: InteractiveQuizProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleOptionClick = (targetSection: string) => {
    const element = document.querySelector(`#${targetSection}`);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsVisible(false);
    try {
      localStorage.setItem('quiz-choice', targetSection);
    } catch {}
    onClose?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <Card className="relative bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-6 shadow-elevated animate-fade-in">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close quiz"
      >
        <X className="w-5 h-5" />
      </button>
      
      <h2 className="font-display text-xl font-bold text-foreground mb-4">
        Choose your path
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quizOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.targetSection)}
              className="text-left"
            >
              <Card className="h-full border-2 border-border/60 hover:border-primary/50 bg-background/70 hover:bg-background transition-spring p-6 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">
                      {option.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Scrolls to your recommended tools below.
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Scrolls to your recommended tools below.
      </p>
    </Card>
  );
};

export default InteractiveQuiz;
