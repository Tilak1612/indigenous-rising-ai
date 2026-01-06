import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { getString } from '@/lib/i18n';
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
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  { title: 'Business Planner', href: '/dashboard/plan', icon: FileText, tier: 'free' },
  { title: 'Resources', href: '/dashboard/resources', icon: BookOpen, tier: 'free' },
  { title: 'Community Forum', href: '/dashboard/forum', icon: MessageSquare, tier: 'free' },
  { title: 'OCAP™ Compliance', href: '/dashboard/compliance', icon: Shield, tier: 'free' },
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

function NavItemLink({ item, currentPath, userTier }: { item: NavItem; currentPath: string; userTier: SubscriptionTier }) {
  const isActive = currentPath === item.href;
  const isLocked = (item.tier === 'paid' && userTier === 'free') || 
                   (item.tier === 'enterprise' && userTier !== 'enterprise');

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "transition-all",
          isLocked && "opacity-60"
        )}
      >
        <Link to={isLocked ? '#' : item.href} className="flex items-center gap-3">
          <item.icon className="h-4 w-4" />
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {item.badge}
            </Badge>
          )}
          {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function DashboardSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscribed, product_id } = useSubscription();
  const userTier = getTierFromSubscription(subscribed, product_id);

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
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">IR</span>
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
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8">
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
    </Sidebar>
  );
}

function DashboardHeader() {
  const { user } = useAuth();
  const { subscribed, product_id } = useSubscription();
  const userTier = getTierFromSubscription(subscribed, product_id);

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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium">New funding match</span>
              <span className="text-xs text-muted-foreground">Indigenous Business Development Program - 85% match</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium">Course reminder</span>
              <span className="text-xs text-muted-foreground">Complete Module 3 of Business Fundamentals</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium">Community update</span>
              <span className="text-xs text-muted-foreground">Elder wisdom session scheduled for next week</span>
            </DropdownMenuItem>
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
