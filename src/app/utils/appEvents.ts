const COUNTS_REFRESH_EVENT = 'app:counts-refresh';

export function emitCountsRefresh() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(COUNTS_REFRESH_EVENT));
}

export function subscribeToCountsRefresh(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(COUNTS_REFRESH_EVENT, handler);
  return () => window.removeEventListener(COUNTS_REFRESH_EVENT, handler);
}
