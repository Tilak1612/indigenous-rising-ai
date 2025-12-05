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
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 fade-in w-full max-w-5xl px-4">
      <nav className="glass bg-card/80 border border-border/60 rounded-2xl px-6 py-3 shadow-aura-lg">
        <div className="flex items-center justify-between">
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
            <div className="hidden sm:flex flex-col">
              <span className="font-display font-semibold text-sm text-foreground tracking-tight">
                Indigenous Rising AI
              </span>
              <span className="text-xs text-muted-foreground">
                Business Support Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.isAnchor) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
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
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {item.name}
                </Link>
              );
            })}
            
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-muted-foreground hidden xl:block">{user.email}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-sm font-medium hover:bg-muted/50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                size="sm"
                className="ml-2 glass bg-gradient-purple text-primary-foreground font-medium rounded-xl px-5 hover:shadow-glow glow-hover"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted/50 transition-smooth"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "lg:hidden transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[400px] opacity-100 pt-4 mt-4 border-t border-border/50" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-1">
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-secondary transition-smooth" />
                    <span className="font-medium">{item.name}</span>
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth group"
                >
                  <Icon className="w-4 h-4 group-hover:text-secondary transition-smooth" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            <div className="pt-4 px-2">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground px-4">
                    {user.email}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full glass bg-gradient-purple text-primary-foreground font-medium rounded-xl hover:shadow-glow"
                  onClick={() => {
                    navigate('/auth');
                    setIsOpen(false);
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
