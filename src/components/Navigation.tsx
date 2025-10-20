import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Users, TrendingUp, Target, Award, Building, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Features', href: '#features', icon: TrendingUp },
    { name: 'Funding', href: '#funding', icon: Target },
    { name: 'Testimonials', href: '#testimonials', icon: Users },
    { name: 'Training', href: '#training', icon: BookOpen },
    { name: 'Partnerships', href: '#partnerships', icon: Building },
    { name: 'Pricing', href: '#pricing', icon: Award }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-natural">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-earth rounded-lg flex items-center justify-center shadow-natural">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-lg text-primary">Indigenous Rising AI</span>
              <span className="text-xs text-muted-foreground font-medium">Business Support</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-smooth group"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector(item.href);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Icon className="w-4 h-4 group-hover:text-primary transition-smooth" />
                  <span className="hidden xl:block">{item.name.split('(')[0].trim()}</span>
                  <span className="xl:hidden">{item.name.split('(')[1]?.replace(')', '') || item.name}</span>
                </a>
              );
            })}
            <Button size="sm" variant="hero" className="ml-4">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-smooth"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "lg:hidden transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-2 pt-4 border-t border-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    const element = document.querySelector(item.href);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-smooth group"
                >
                  <Icon className="w-5 h-5 group-hover:text-primary transition-smooth" />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            })}
            <div className="pt-4 px-4">
              <Button variant="hero" className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;