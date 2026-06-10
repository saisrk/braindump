'use client';

import { createContext, useContext, useRef, useCallback } from 'react';

export interface BookOrigin {
  gradient: string;
  rect: DOMRect;
}

interface BookTransitionContextValue {
  setOrigin: (origin: BookOrigin | null) => void;
  getOrigin: () => BookOrigin | null;
}

const BookTransitionContext = createContext<BookTransitionContextValue>({
  setOrigin: () => {},
  getOrigin: () => null,
});

export function BookTransitionProvider({ children }: { children: React.ReactNode }) {
  // Use a ref so reads are always synchronous — no re-render needed
  const originRef = useRef<BookOrigin | null>(null);

  const setOrigin = useCallback((origin: BookOrigin | null) => {
    originRef.current = origin;
  }, []);

  const getOrigin = useCallback(() => originRef.current, []);

  return (
    <BookTransitionContext.Provider value={{ setOrigin, getOrigin }}>
      {children}
    </BookTransitionContext.Provider>
  );
}

export function useBookTransition() {
  return useContext(BookTransitionContext);
}
