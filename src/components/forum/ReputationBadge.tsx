/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Shield, 
  Star, 
  Users, 
  Sparkles,
  Crown,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeType = 
  | 'elder_advisor' 
  | 'funding_expert' 
  | 'moderator' 
  | 'founding_member'
  | 'top_contributor'
  | 'mentor'
  | 'verified_business'
  | 'community_builder';

interface ReputationBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const badgeConfig: Record<BadgeType, { 
  label: string; 
  icon: React.ElementType; 
  className: string;
  description: string;
}> = {
  elder_advisor: {
    label: 'Elder Advisor',
    icon: Crown,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    description: 'Recognized elder providing wisdom and guidance',
  },
  funding_expert: {
    label: 'Funding Expert',
    icon: TrendingUp,
    className: 'bg-success/10 text-success border-success/20',
    description: 'Expertise in grants and funding applications',
  },
  moderator: {
    label: 'Moderator',
    icon: Shield,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    description: 'Community moderator and guide',
  },
  founding_member: {
    label: '3-Year Member',
    icon: Star,
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    description: 'Member for 3+ years',
  },
  top_contributor: {
    label: 'Top Contributor',
    icon: Sparkles,
    className: 'bg-primary/10 text-primary border-primary/20',
    description: 'Highly active community contributor',
  },
  mentor: {
    label: 'Mentor',
    icon: Users,
    className: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    description: 'Active business mentor',
  },
  verified_business: {
    label: 'Verified Business',
    icon: Award,
    className: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    description: 'Verified Indigenous business owner',
  },
  community_builder: {
    label: 'Community Builder',
    icon: MessageSquare,
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    description: '100+ helpful posts',
  },
};

export function ReputationBadge({ type, size = 'sm', showLabel = true }: ReputationBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 font-normal",
        config.className,
        size === 'sm' ? 'text-xs py-0 h-5' : 'text-sm py-0.5'
      )}
      title={config.description}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      {showLabel && config.label}
    </Badge>
  );
}

// Badge assignment will come from real reputation data once the forum is wired
// to its backing tables. We do not seed fabricated named users with badges.
export function getAuthorBadges(_authorName: string): BadgeType[] {
  return [];
}
