import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Menu, X, Users, TrendingUp, Target, Award, BookOpen, LogIn, LogOut, ArrowUpRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoFull from '@/assets/logo-full.png';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Funding', href: '#funding', icon: Target, isAnchor: true },
    { name: 'Learning', href: '#training', icon: BookOpen, isAnchor: true },
    { name: 'Success Stories', href: '/success-stories', icon: Users, isAnchor: false },
    { name: 'Pricing', href: '#pricing', icon: Award, isAnchor: true },
  ];

  const appNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: TrendingUp, isAnchor: false },
    { name: 'Plan', href: '/dashboard/plan', icon: Award, isAnchor: false },
    { name: 'Funding', href: '/dashboard/funding/matches', icon: Target, isAnchor: false },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen, isAnchor: false },
    { name: 'Forum', href: '/dashboard/forum', icon: Users, isAnchor: false },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, isAnchor: false }
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          {/* Logo — left */}
          <Link to="/" className="shrink-0 text-lg font-semibold text-white tracking-tight font-geist">
            <img
              src={logoFull}
              alt="Indigenous Rising AI - Business Support Platform for Indigenous Entrepreneurs"
              className="h-10 w-auto"
              width={120}
              height={40}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          {/* Desktop Navigation — centered */}
          <nav className="hidden md:flex items-center gap-8 text-white/90 absolute left-1/2 -translate-x-1/2">
            {(user ? appNavItems : navItems).map((item) => {
              if (item.isAnchor) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="hover:text-white transition text-sm font-medium font-geist whitespace-nowrap"
                    onClick={(e) => {
                      e.preventDefault();
                      if (location.pathname !== '/') {
                        navigate(`/${item.href}`);
                        return;
                      }
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
                  className="hover:text-white transition text-sm font-medium font-geist whitespace-nowrap"
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side — Login / Logout + mobile menu */}
          <div className="flex items-center gap-6">
            {user ? (
              <button
                onClick={() => signOut()}
                className="hidden md:inline-flex items-center gap-2 hover:text-white transition text-sm font-medium text-white/90 font-geist"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="hidden md:inline-flex items-center gap-2 hover:text-white transition text-sm font-medium text-white/90 font-geist"
              >
                Login
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 text-white/90 hover:text-white transition"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div id="mobile-navigation" className={cn(
        "md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-neutral-900/95 backdrop-blur-sm",
        isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 py-4 space-y-1">
          {(user ? appNavItems : navItems).map((item) => {
            const Icon = item.icon;
            
            if (item.isAnchor) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    if (location.pathname !== '/') {
                      navigate(`/${item.href}`);
                      return;
                    }
                    const element = document.querySelector(item.href);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition group"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium font-geist">{item.name}</span>
                </a>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition group"
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium font-geist">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 px-2 border-t border-white/10 mt-4">
            {user ? (
              <div className="space-y-2">
                <p className="text-sm text-center text-white/60 px-4 font-geist">
                  {user.email}
                </p>
                <ShinyButton 
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </ShinyButton>
              </div>
            ) : (
              <ShinyButton 
                size="sm"
                className="w-full"
                onClick={() => {
                  navigate('/auth');
                  setIsOpen(false);
                }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </ShinyButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
