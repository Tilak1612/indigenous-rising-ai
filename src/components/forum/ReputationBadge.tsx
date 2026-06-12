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
    className: 'bg-warning/10 text-warning border-warning/30',
    description: 'Recognized elder providing wisdom and guidance',
  },
  funding_expert: {
    label: 'Funding Expert',
    icon: TrendingUp,
    className: 'bg-success/10 text-success border-success/30',
    description: 'Expertise in grants and funding applications',
  },
  moderator: {
    label: 'Moderator',
    icon: Shield,
    className: 'bg-primary/10 text-primary border-primary/30',
    description: 'Community moderator and guide',
  },
  founding_member: {
    label: '3-Year Member',
    icon: Star,
    className: 'bg-warning/10 text-warning border-warning/30',
    description: 'Member for 3+ years',
  },
  top_contributor: {
    label: 'Top Contributor',
    icon: Sparkles,
    className: 'bg-primary/10 text-primary border-primary/30',
    description: 'Highly active community contributor',
  },
  mentor: {
    label: 'Mentor',
    icon: Users,
    className: 'bg-primary/10 text-primary border-primary/30',
    description: 'Active business mentor',
  },
  verified_business: {
    label: 'Verified Business',
    icon: Award,
    className: 'bg-success/10 text-success border-success/30',
    description: 'Verified Indigenous business owner',
  },
  community_builder: {
    label: 'Community Builder',
    icon: MessageSquare,
    className: 'bg-warning/10 text-warning border-warning/30',
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
