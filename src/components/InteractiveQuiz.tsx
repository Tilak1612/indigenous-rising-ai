import { useState } from 'react';
import { ShinyButton } from '@/components/ui/shiny-button';
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
    targetSection: 'features',
  },
  {
    id: 'growing',
    title: 'Growing Existing Business',
    icon: TrendingUp,
    targetSection: 'training',
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
      
      <h3 className="font-display text-xl font-bold text-foreground mb-4">
        What brings you here today?
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quizOptions.map((option) => {
          const Icon = option.icon;
          return (
            <ShinyButton
              key={option.id}
              size="sm"
              className="h-auto flex-col gap-3 p-6 group"
              onClick={() => handleOptionClick(option.targetSection)}
            >
              <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm text-center">
                {option.title}
              </span>
            </ShinyButton>
          );
        })}
      </div>
    </Card>
  );
};

export default InteractiveQuiz;
