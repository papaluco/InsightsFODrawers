import { CSSProperties, RefObject, useCallback, useEffect, useLayoutEffect, useState } from 'react';

/**
 * Shared behavior for dropdowns rendered in a portal on document.body.
 *
 * Portaling keeps menus above full-screen overlays (z-50), the Site Drivers drawer
 * (z-[55]) and Schoolie (z-[60]) — NXT-77201 spec §12 z-index plan — and stops them
 * being clipped by a scrolling container. Menus flip above their trigger when there
 * isn't room below, and stay inside the viewport horizontally.
 */

/** Above the overlay and drawer layers in spec §12. */
export const FLOATING_DROPDOWN_Z_INDEX = 100;

const TRIGGER_GAP = 8;
const VIEWPORT_MARGIN = 8;

const HIDDEN_STYLE: CSSProperties = { position: 'fixed', top: 0, left: 0, visibility: 'hidden', zIndex: FLOATING_DROPDOWN_Z_INDEX };

/**
 * Fixed-position style for a floating element anchored to `triggerRef`. Measures the
 * floating element itself, so pass a different `contentKey` when its content changes
 * size (e.g. switching from an option list to a date picker).
 */
export function useFloatingPosition(
  triggerRef: RefObject<HTMLElement>,
  floatingRef: RefObject<HTMLElement>,
  isOpen: boolean,
  contentKey?: string,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>(HIDDEN_STYLE);

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    const floating = floatingRef.current;
    if (!trigger || !floating) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - TRIGGER_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - TRIGGER_GAP - VIEWPORT_MARGIN;
    const contentHeight = floating.scrollHeight;
    const openUpward = contentHeight > spaceBelow && spaceAbove > spaceBelow;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, viewportWidth - floating.offsetWidth - VIEWPORT_MARGIN));

    setStyle({
      position: 'fixed',
      left,
      zIndex: FLOATING_DROPDOWN_Z_INDEX,
      // Never taller than the room on the chosen side; the menu's list scrolls inside it.
      maxHeight: Math.max(openUpward ? spaceAbove : spaceBelow, 0),
      ...(openUpward ? { bottom: viewportHeight - rect.top + TRIGGER_GAP } : { top: rect.bottom + TRIGGER_GAP }),
    });
  }, [triggerRef, floatingRef]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setStyle(HIDDEN_STYLE);
      return;
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, contentKey, update]);

  return style;
}

/**
 * While open, Escape closes this dropdown and nothing else. The listener runs in the
 * capture phase and stops propagation, so a containing overlay's Escape handler only
 * fires when no dropdown is open.
 */
export function useCloseOnEscape(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      onClose();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);
}

/** Closes when a mousedown lands outside every given element (trigger wrapper and portaled menu). */
export function useCloseOnOutsideClick(refs: RefObject<HTMLElement>[], isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.every(ref => !ref.current?.contains(target))) onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable ref objects
  }, [isOpen, onClose]);
}
