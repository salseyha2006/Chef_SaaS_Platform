import { useEffect } from 'react';

/**
 * UX 5.2: ពេល Processing មិនអនុញ្ញាត Back / Refresh / Pull-to-refresh
 * - popstate: ដាក់ History Entry ត្រឡប់វិញ (Back មិនចេញ)
 * - beforeunload: ព្រមាន Reload/បិទ Tab
 * - overscroll-behavior: បិទ Pull-to-refresh
 */
export function useLockNavigation(active) {
  useEffect(() => {
    if (!active) return undefined;

    const keep = () => window.history.pushState(null, '', window.location.href);
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    keep();
    window.addEventListener('popstate', keep);
    window.addEventListener('beforeunload', onBeforeUnload);
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overscrollBehavior = 'none';

    return () => {
      window.removeEventListener('popstate', keep);
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [active]);
}