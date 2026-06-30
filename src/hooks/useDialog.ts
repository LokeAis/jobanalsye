import { useEffect, useRef } from 'react';

/**
 * Accessibility helper for modal dialogs:
 * - Escape closes the dialog
 * - Tab is trapped within the dialog
 * - focus moves into the dialog on open (prefers a [data-autofocus] element)
 * - focus returns to the previously focused element on close
 *
 * Attach the returned ref to the dialog's content container (give it tabIndex={-1}).
 * `onClose` MUST be stable (wrap in useCallback) to avoid re-running on every render.
 */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = ref.current;

    const focusables = (): HTMLElement[] => {
      if (!container) return [];
      const nodes = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && el.offsetParent !== null
      );
    };

    const initial =
      container?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? container;
    initial?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && container) {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}
