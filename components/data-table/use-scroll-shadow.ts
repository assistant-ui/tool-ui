'use client'

import { useEffect, useState, useCallback, RefObject } from 'react'

interface ScrollShadowState {
  canScrollLeft: boolean
  canScrollRight: boolean
  canScrollTop: boolean
  canScrollBottom: boolean
}

/**
 * Hook to detect scroll position and determine which shadow affordances to show
 * @param ref - React ref to the scrollable element
 * @param threshold - Pixels from edge to consider "at end" (default: 10)
 * @returns Object with boolean flags for each scroll direction
 */
export function useScrollShadow(
  ref: RefObject<HTMLElement | null>,
  threshold: number = 10
): ScrollShadowState {
  const [state, setState] = useState<ScrollShadowState>({
    canScrollLeft: false,
    canScrollRight: false,
    canScrollTop: false,
    canScrollBottom: false,
  })

  const checkScroll = useCallback(() => {
    const element = ref.current
    if (!element) return

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = element

    setState({
      canScrollLeft: scrollLeft > threshold,
      canScrollRight: scrollLeft < scrollWidth - clientWidth - threshold,
      canScrollTop: scrollTop > threshold,
      canScrollBottom: scrollTop < scrollHeight - clientHeight - threshold,
    })
  }, [ref, threshold])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check on mount
    checkScroll()

    // Check on scroll
    element.addEventListener('scroll', checkScroll)

    // Check on resize (container or window)
    const resizeObserver = new ResizeObserver(checkScroll)
    resizeObserver.observe(element)
    window.addEventListener('resize', checkScroll)

    return () => {
      element.removeEventListener('scroll', checkScroll)
      resizeObserver.disconnect()
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, ref])

  return state
}
