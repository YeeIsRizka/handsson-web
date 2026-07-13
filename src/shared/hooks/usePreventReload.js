import { useEffect } from 'react';

/**
 * Prevents accidental page refresh by showing a native browser prompt.
 *
 * @param {boolean} shouldPrevent - Whether the prompt should be active
 */
export default function usePreventReload(shouldPrevent = true) {
  useEffect(() => {
    if (!shouldPrevent) return;

    const handleBeforeUnload = (e) => {

      if (window.__ALLOW_NAVIGATE__) return;


      e.preventDefault();
      // Required for Chrome to show the dialog
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldPrevent]);
}
