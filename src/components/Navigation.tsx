import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Users, TrendingUp, Target, Award, Building, BookOpen, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoFull from '@/assets/logo-full.png';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Features', href: '#features', icon: TrendingUp, isAnchor: true },
    { name: 'Funding', href: '#funding', icon: Target, isAnchor: true },
    { name: 'Testimonials', href: '#testimonials', icon: Users, isAnchor: true },
    { name: 'Training Program', href: '/training', icon: BookOpen, isAnchor: false },
    { name: 'Partnerships', href: '#partnerships', icon: Building, isAnchor: true },
    { name: 'Pricing', href: '#pricing', icon: Award, isAnchor: true }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img 
            src={logoFull} 
            alt="Indigenous Rising AI - Business Support Platform for Indigenous Entrepreneurs" 
            className="h-10 w-auto transition-all duration-300 group-hover:scale-105"
            width={120}
            height={40}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <span className="font-display text-xl tracking-tight font-medium text-foreground hover:text-primary transition-colors hidden sm:block">
            Indigenous Rising AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide">
          {navItems.map((item) => {
            if (item.isAnchor) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground/70 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector(item.href);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.name}
                </a>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            );
          })}
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">{user.email}</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => signOut()}
                className="rounded-full px-4 flex items-center gap-2 border-border hover:border-primary hover:text-primary"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <Button 
              className="px-6 py-2.5 bg-foreground text-background rounded-full hover:bg-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 font-semibold"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-foreground focus:outline-none p-2"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "lg:hidden transition-all duration-300 ease-in-out overflow-hidden bg-background/95 backdrop-blur-md border-b border-border/50",
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 border-none"
      )}>
        <div className="px-6 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.isAnchor) {
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 px-4">
            {user ? (
              <div className="space-y-3">
                <div className="text-sm text-center text-muted-foreground">
                  {user.email}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full rounded-full flex items-center justify-center gap-2"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full px-6 py-3 bg-foreground text-background rounded-full hover:bg-primary transition-all font-semibold"
                onClick={() => {
                  navigate('/auth');
                  setIsOpen(false);
                }}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;