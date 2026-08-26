import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Users, TrendingUp, Target, Award, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/BrandMark';

/**
 * Shared marketing header for every interior page. Matches the homepage
 * (LandingV2) header exactly: a sticky cream/blur bar with dark text,
 * brand mark, the marketing nav, and a forest-green CTA — so the header
 * is pixel-consistent across the whole site instead of the old transparent
 * white-on-hero overlay (which was invisible on the cream pages). Always shows
 * the marketing nav; logged-in users get a "Dashboard" CTA on the right.
 */
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Homepage (LandingV2) section IDs/vocabulary so the anchors resolve. Off the
  // homepage these navigate to /#section; on it they smooth-scroll.
  const navItems = [
    { name: 'Platform', href: '#platform', icon: Target },
    { name: 'How it works', href: '#how', icon: TrendingUp },
    { name: 'Sovereignty', href: '#sovereignty', icon: Users },
    { name: 'Pricing', href: '#pricing', icon: Award },
    { name: 'FAQ', href: '#faq', icon: BookOpen },
  ];

  const handleAnchor = (href: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${href}`);
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F5F0E8]/85 backdrop-blur-md border-b border-[#3D3A34]/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo — brand mark + wordmark (matches the homepage brand) */}
          <Link to="/" className="shrink-0 flex items-center gap-2.5" aria-label="Indigenous Rising AI — home">
            <BrandMark size={32} />
            <span className="font-display font-semibold text-[19px] text-[#111111] tracking-tight">
              Indigenous Rising
            </span>
          </Link>

          {/* Desktop marketing nav — centered */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-[#111111]/80 hover:text-[#124C3B] transition whitespace-nowrap"
                onClick={(e) => { e.preventDefault(); handleAnchor(item.href); }}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right side — auth-aware CTA + mobile menu */}
          <div className="flex items-center gap-5">
            {user ? (
              <Link
                to="/dashboard"
                className="hidden md:inline-flex items-center rounded-[10px] bg-[#124C3B] px-5 py-2.5 text-sm font-semibold text-[#F5F0E8] hover:bg-[#0F3F31] transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hidden md:inline-flex items-center text-sm font-medium text-[#3D3A34] hover:text-[#111111] transition"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  className="hidden md:inline-flex items-center rounded-[10px] bg-[#124C3B] px-5 py-2.5 text-sm font-semibold text-[#F5F0E8] hover:bg-[#0F3F31] transition"
                >
                  Start free account
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 text-[#111111] hover:text-[#124C3B] transition"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — cream panel, dark text (matches the header) */}
      <div id="mobile-navigation" className={cn(
        "md:hidden overflow-hidden border-t border-[#3D3A34]/10 bg-[#F5F0E8] transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleAnchor(item.href); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#111111]/80 hover:text-[#111111] hover:bg-[#3D3A34]/5 transition"
              >
                <Icon className="w-4 h-4 text-[#124C3B]" />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}

          <div className="pt-4 px-2 border-t border-[#3D3A34]/10 mt-4">
            <Link
              to={user ? '/dashboard' : '/auth'}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-[10px] bg-[#124C3B] px-5 py-3 text-sm font-semibold text-[#F5F0E8] hover:bg-[#0F3F31] transition"
            >
              {user ? 'Dashboard' : 'Start free account'}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
