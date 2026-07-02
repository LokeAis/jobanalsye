export type AnalyticsEvent = 'test_started' | 'test_completed' | 'job_analysis_run' | 'interview_started';

/** Fire-and-forget aggregate event ping. Never throws, never blocks the UI. */
export function track(event: AnalyticsEvent): void {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
  }).catch(() => {});
}
