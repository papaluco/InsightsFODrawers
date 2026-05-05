import React from 'react';
import { EngagementTier } from '../../utils/engagementTiers';

interface Props {
  tier: EngagementTier;
}

const EngagementTierBadge: React.FC<Props> = ({ tier }) => (
  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}>
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tier.color }} />
    {tier.label}
  </span>
);

export default EngagementTierBadge;
