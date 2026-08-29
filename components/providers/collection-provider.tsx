"use client";

import * as React from "react";

const FAVORITES_KEY = "vellora:favorites";
const COMPARE_KEY = "vellora:compare";
export const COMPARE_LIMIT = 4;

type Snapshot = { favorites: string[]; compare: string[] };

/* -------------------------------------------------------------------------- */
/*  A tiny external store over localStorage.                                  */
/*                                                                            */
/*  `useSyncExternalStore` is the right primitive here: it gives React a       */
/*  server snapshot (empty) and a client snapshot (whatever is stored), so     */
/*  hydration matches without an effect that immediately calls setState.       */
/* -------------------------------------------------------------------------- */

const EMPTY: Snapshot = Object.freeze({ favorites: [], compare: [] });
const listeners = new Set<() => void>();

// The snapshot object identity must stay stable between reads or React will
// re-render forever, so it is only replaced when the data actually changes.
let snapshot: Snapshot = EMPTY;

function readKey(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    // Private browsing, disabled storage, or a corrupted value — start empty.
    return [];
  }
}

function same(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

function refresh() {
  const favorites = readKey(FAVORITES_KEY);
  const compare = readKey(COMPARE_KEY);
  if (same(favorites, snapshot.favorites) && same(compare, snapshot.compare)) return;
  snapshot = { favorites, compare };
  listeners.forEach((listener) => listener());
}

function persist(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable. The session still works; it just will not persist.
  }
  snapshot =
    key === FAVORITES_KEY
      ? { ...snapshot, favorites: value }
      : { ...snapshot, compare: value };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) refresh();
  listeners.add(listener);
  // Keep other tabs in step.
  window.addEventListener("storage", refresh);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", refresh);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

/* -------------------------------------------------------------------------- */

type CollectionContextValue = {
  favorites: string[];
  compare: string[];
  /** False until the browser store has been read, so nothing flashes. */
  ready: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  isComparing: (id: string) => boolean;
  toggleCompare: (id: string) => { added: boolean; full: boolean };
  removeCompare: (id: string) => void;
  clearCompare: () => void;
};

const CollectionContext = React.createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const { favorites, compare } = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const ready = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const value = React.useMemo<CollectionContextValue>(() => {
    const toggleFavorite = (id: string) => {
      const next = favorites.includes(id)
        ? favorites.filter((v) => v !== id)
        : [...favorites, id];
      persist(FAVORITES_KEY, next);
      return next.length > favorites.length;
    };

    const toggleCompare = (id: string) => {
      if (compare.includes(id)) {
        persist(COMPARE_KEY, compare.filter((v) => v !== id));
        return { added: false, full: false };
      }
      if (compare.length >= COMPARE_LIMIT) return { added: false, full: true };
      persist(COMPARE_KEY, [...compare, id]);
      return { added: true, full: false };
    };

    return {
      favorites,
      compare,
      ready,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      removeFavorite: (id) => persist(FAVORITES_KEY, favorites.filter((v) => v !== id)),
      clearFavorites: () => persist(FAVORITES_KEY, []),
      isComparing: (id) => compare.includes(id),
      toggleCompare,
      removeCompare: (id) => persist(COMPARE_KEY, compare.filter((v) => v !== id)),
      clearCompare: () => persist(COMPARE_KEY, []),
    };
  }, [favorites, compare, ready]);

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollections() {
  const ctx = React.useContext(CollectionContext);
  if (!ctx) throw new Error("useCollections must be used inside <CollectionProvider>");
  return ctx;
}
