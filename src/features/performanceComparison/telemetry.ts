import { MOCK_CURRENT_USER } from '../../data/mockCurrentUser';
import { trackInsightsEvent } from '../../services/insightsUsageService';
import type { InsightsEventContext, InsightsEventType } from '../../types/insightsUsageTypes';

/** Performance Comparison telemetry (spec §12), tagged with the comparison entry point. */
export const trackComparisonEvent = (eventType: InsightsEventType, context: InsightsEventContext = {}) =>
  trackInsightsEvent({
    eventType,
    userId: MOCK_CURRENT_USER.userId,
    districtId: MOCK_CURRENT_USER.districtId,
    platform: 'SchoolCafe',
    context: { entryPoint: 'PerformanceComparison', ...context },
  });
