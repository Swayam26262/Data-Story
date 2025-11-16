'use client';

import { FileText, TrendingUp, Award } from 'lucide-react';
import { type UserTier } from '@/lib/tier-config';

interface StatsCardsProps {
  totalStories: number;
  storiesThisMonth: number;
  currentTier: UserTier;
  isLoading?: boolean;
}

export default function StatsCards({
  totalStories,
  storiesThisMonth,
  currentTier,
  isLoading = false,
}: StatsCardsProps) {
  const tierDisplayNames: Record<UserTier, string> = {
    free: 'Free',
    professional: 'Professional',
    business: 'Business',
    enterprise: 'Enterprise',
  };

  const stats = [
    {
      label: 'Total Stories',
      value: totalStories,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Stories This Month',
      value: storiesThisMonth,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Current Tier',
      value: tierDisplayNames[currentTier],
      icon: Award,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#0A0A0A] rounded-xl p-4 md:p-6 border border-secondary/50 shadow-lg animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-3"></div>
                <div className="h-8 bg-white/10 rounded w-16"></div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 w-12 h-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-[#0A0A0A] rounded-2xl p-6 border border-[#2a2a2a] shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#A0A0A0] mb-2 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} rounded-xl p-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
