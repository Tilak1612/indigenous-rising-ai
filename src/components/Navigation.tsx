import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Users, TrendingUp, Target, Award, Building, BookOpen, LogIn, LogOut, User } from 'lucide-react';
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
    { name: 'Success', href: '#testimonials', icon: Users, isAnchor: true },
    { name: 'Programs', href: '/training', icon: BookOpen, isAnchor: false },
  ];

  return (
    <nav className="fixed z-50 pt-6 px-4 sm:px-6 top-0 right-0 left-0">
      <div className="max-w-4xl mx-auto">
        <div className="glass-nav border border-white/10 rounded-full px-4 sm:px-6 py-3 border-gradient">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src={logoFull} 
                alt="Indigenous Rising AI - Business Support Platform for Indigenous Entrepreneurs" 
                className="h-9 w-auto object-contain"
                style={{ maxWidth: '100px' }}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-1 text-sm font-medium text-white/60">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.isAnchor ? (
                    <a
                      href={item.href}
                      className="hover:text-white transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/5"
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.querySelector(item.href);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="hover:text-white transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/5"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Right side buttons */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex md:hidden hover:bg-white/5 p-2 rounded-full transition-all duration-300 border border-white/5"
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                aria-label="Menu"
              >
                {isOpen ? (
                  <X className="w-5 h-5 stroke-[1.5] text-white/70" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[1.5] text-white/70" />
                )}
              </button>

              {/* Account button */}
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="hidden md:inline-flex hover:bg-white/5 p-2 rounded-full transition-all duration-300 border border-white/5"
                  style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 stroke-[1.5] text-white/60" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="hidden md:inline-flex hover:bg-white/5 p-2 rounded-full transition-all duration-300 border border-white/5"
                  style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  aria-label="Account"
                >
                  <User className="w-4 h-4 stroke-[1.5] text-white/60" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-in-out overflow-hidden mt-2",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="glass-nav rounded-2xl p-4 border border-white/10 border-gradient">
            <div className="space-y-2">
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
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
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
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-full bg-white text-zinc-900 hover:bg-white/90 transition-all font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
