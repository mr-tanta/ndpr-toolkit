import { useMemo } from 'react';
import { assessBreachNotification } from '../utils/breach-notification';
import type {
  BreachNotificationOptions,
  BreachNotificationAssessment,
} from '../utils/breach-notification';
import type { BreachReport } from '../types/breach';

/**
 * React hook that memoises the `assessBreachNotification` utility — checks a
 * breach report's completeness against the NDPA S. 40 / GAID 2025 Article 33
 * notification requirements (mandated content, the 72-hour window, and any
 * data-subject communication owed on high risk).
 */
export function useBreachNotificationAssessment(
  report: BreachReport,
  options?: BreachNotificationOptions,
): BreachNotificationAssessment {
  return useMemo(() => assessBreachNotification(report, options), [report, options]);
}
