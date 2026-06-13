import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import { RisingGlyph } from '@/components/RisingGlyph';
import { useNotifications } from '@/hooks/useNotifications';
import { getString } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  FileText,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  Settings,
  Shield,
  Key,
  Building2,
  Headphones,
  Crown,
  Lock,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  User,
  Globe,
  MessageSquare,
  Calendar,
  ListChecks,
  Sparkles,
  Briefcase,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type SubscriptionTier = 'free' | 'paid' | 'enterprise';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  tier: SubscriptionTier;
  badge?: string;
}

const LANG_KEY = 'preferred-language';

const freeNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home, tier: 'free' },
  { title: 'Funding Matches', href: '/dashboard/funding/matches', icon: Target, tier: 'free', badge: 'AI' },
  { title: 'Business Planner', href: '/dashboard/plan', icon: FileText, tier: 'free' },
  { title: 'AI Assistant', href: '/dashboard/assistant', icon: Sparkles, tier: 'free', badge: 'AI' },
  { title: 'Tasks & Deadlines', href: '/dashboard/tasks', icon: ListChecks, tier: 'free' },
  { title: 'Resources', href: '/dashboard/resources', icon: BookOpen, tier: 'free' },
  { title: 'Documents', href: '/dashboard/documents', icon: FolderOpen, tier: 'free' },
  { title: 'Community Forum', href: '/dashboard/forum', icon: MessageSquare, tier: 'free' },
  { title: 'OCAP® Compliance', href: '/dashboard/compliance', icon: Shield, tier: 'free' },
];

const paidNavItems: NavItem[] = [
  { title: 'Funding Navigator', href: '/dashboard/funding', icon: Target, tier: 'paid', badge: 'AI' },
  { title: 'Impact Analytics', href: '/dashboard/analytics', icon: TrendingUp, tier: 'paid' },
  { title: 'Partner Network', href: '/dashboard/network', icon: Users, tier: 'paid' },
  { title: 'Certifications', href: '/dashboard/certifications', icon: Crown, tier: 'paid' },
  { title: 'Templates', href: '/dashboard/templates', icon: Briefcase, tier: 'paid' },
  { title: 'API Access', href: '/dashboard/api', icon: Key, tier: 'paid' },
];

const enterpriseNavItems: NavItem[] = [
  { title: 'Team Management', href: '/dashboard/team', icon: Users, tier: 'enterprise' },
  { title: 'Security Center', href: '/dashboard/security', icon: Shield, tier: 'enterprise' },
  { title: 'Integrations', href: '/dashboard/integrations', icon: Building2, tier: 'enterprise' },
  { title: 'Training Calendar', href: '/dashboard/training-calendar', icon: Calendar, tier: 'enterprise' },
  { title: 'Support Tickets', href: '/dashboard/support', icon: Headphones, tier: 'enterprise' },
];

function getTierFromSubscription(subscribed: boolean, productId: string | null): SubscriptionTier {
  if (!subscribed) return 'free';
  if (productId?.toLowerCase().includes('enterprise') || productId?.toLowerCase().includes('gimishoomis')) {
    return 'enterprise';
  }
  return 'paid';
}

function NavItemLink({
  item,
  currentPath,
  userTier,
  onLockedClick,
}: {
  item: NavItem;
  currentPath: string;
  userTier: SubscriptionTier;
  onLockedClick: (item: NavItem) => void;
}) {
  const isActive = currentPath === item.href;
  const isLocked = (item.tier === 'paid' && userTier === 'free') ||
                   (item.tier === 'enterprise' && userTier !== 'enterprise');

  // Locked items render a button that opens the upgrade dialog instead of a
  // dead <Link to="#"> which previously caused a silent redirect to /dashboard
  // and bypassed the upsell entirely.
  if (isLocked) {
    const requiredPlan = item.tier === 'enterprise' ? 'Gimishoomis' : 'Ogichidaakwe';
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={false}
          className="transition-all opacity-70"
          onClick={() => onLockedClick(item)}
          aria-label={`${item.title} — requires ${requiredPlan} plan`}
        >
          <item.icon className="h-4 w-4" />
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {item.badge}
            </Badge>
          )}
          <Lock className="h-3 w-3 text-muted-foreground" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="transition-all">
        <Link to={item.href} className="flex items-center gap-3">
          <item.icon className="h-4 w-4" />
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function UpgradeDialog({
  item,
  open,
  onOpenChange,
}: {
  item: NavItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item) return null;
  const isEnterprise = item.tier === 'enterprise';
  const planName = isEnterprise ? 'Gimishoomis (Enterprise)' : 'Ogichidaakwe (Growth — $49/mo CAD)';
  const ctaText = isEnterprise ? 'Contact Sales' : 'View Pricing';
  const ctaHref = isEnterprise ? '/contact' : '/pricing';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{item.title} is locked</DialogTitle>
              <DialogDescription className="mt-1">
                Upgrade to the {planName} plan to unlock this feature.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button asChild>
            <Link to={ctaHref} onClick={() => onOpenChange(false)}>
              <Crown className="h-4 w-4 mr-2" />
              {ctaText}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DashboardSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscribed, product_id } = useSubscription();
  const userTier = getTierFromSubscription(subscribed, product_id);
  const [upgradeItem, setUpgradeItem] = useState<NavItem | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Cast: avatar_url isn't in the generated Database type yet.
    // Regenerate types with `supabase gen types typescript` to remove.
    (supabase as any)
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }: { data: { avatar_url?: string } | null }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  const preferredLang = (() => {
    try { return localStorage.getItem(LANG_KEY) || 'en'; }
    catch { return 'en'; }
  })();

  const tierLabel = userTier === 'enterprise' ? 'Gimishoomis' :
                    userTier === 'paid' ? 'Ogichidaakwe' : 'Maadaadiziwin';
  const tierColor = userTier === 'enterprise' ? 'bg-amber-500' :
                    userTier === 'paid' ? 'bg-primary' : 'bg-muted';

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <RisingGlyph size={19} />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">Indigenous Rising</span>
            <Badge className={cn("ml-2 text-xs", tierColor)}>{tierLabel}</Badge>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Free Tier Features */}
        <SidebarGroup>
          <SidebarGroupLabel>Core Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {freeNavItems.map((item) => (
                <NavItemLink
                  key={item.href}
                  item={item}
                  currentPath={location.pathname}
                  userTier={userTier}
                  onLockedClick={setUpgradeItem}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Paid Tier Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            Pro Features
            {userTier === 'free' && (
              <Badge variant="outline" className="text-xs">Upgrade</Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {paidNavItems.map((item) => (
                <NavItemLink
                  key={item.href}
                  item={item}
                  currentPath={location.pathname}
                  userTier={userTier}
                  onLockedClick={setUpgradeItem}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Enterprise Tier Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            Enterprise
            {userTier !== 'enterprise' && (
              <Badge variant="outline" className="text-xs">Contact Us</Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enterpriseNavItems.map((item) => (
                <NavItemLink
                  key={item.href}
                  item={item}
                  currentPath={location.pathname}
                  userTier={userTier}
                  onLockedClick={setUpgradeItem}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pb-16">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{tierLabel} Plan</p>
          </div>
        </div>
        <div className="mt-2 flex gap-2 group-data-[collapsible=icon]:flex-col">
          <Button variant="ghost" size="sm" asChild className="flex-1 justify-start">
            <Link to="/dashboard/settings">
              <Settings className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="flex-1 justify-start text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
      <UpgradeDialog
        item={upgradeItem}
        open={!!upgradeItem}
        onOpenChange={(open) => !open && setUpgradeItem(null)}
      />
    </Sidebar>
  );
}

function DashboardHeader() {
  const { user } = useAuth();
  const { subscribed, product_id } = useSubscription();
  const userTier = getTierFromSubscription(subscribed, product_id);
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState<string | null>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }: { data: { avatar_url?: string } | null }) => {
        if (data?.avatar_url) setHeaderAvatarUrl(data.avatar_url);
      });
  }, [user]);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search features, resources..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {userTier === 'free' && (
          <Button size="sm" asChild className="hidden sm:flex">
            <Link to="/pricing">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Link>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); markAllRead(); }}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-0.5 p-3 cursor-pointer"
                    onSelect={() => { if (!n.read) markRead(n.id); }}
                  >
                    <div className="flex w-full items-center gap-2">
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" aria-hidden />}
                      <span className={`font-medium ${n.read ? 'text-muted-foreground' : ''}`}>
                        {n.title || 'Notification'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                    <span className="text-[11px] text-muted-foreground/70">
                      {new Date(n.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Français</DropdownMenuItem>
            <DropdownMenuItem>Anishinaabemowin</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                {headerAvatarUrl && <AvatarImage src={headerAvatarUrl} alt="Profile" className="object-cover" />}
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
