import React, { useState, useEffect, useRef } from 'react';
import { LawfulBasisTracker } from '../components/lawful-basis/LawfulBasisTracker';
import type { LawfulBasisTrackerClassNames } from '../components/lawful-basis/LawfulBasisTracker';
import type { ProcessingActivity } from '../types/lawful-basis';
import type { StorageAdapter } from '../adapters/types';

/**
 * UX copy overrides for the NDPRLawfulBasis preset. Pass any subset to
 * replace the default text without dropping to the lower-level
 * `<LawfulBasisTracker>` API.
 */
export interface NDPRLawfulBasisCopy {
  /** Tracker heading. Default: "Lawful Basis Tracker" */
  title?: string;
  /** Body paragraph under the heading. */
  description?: string;
}

export interface NDPRLawfulBasisProps {
  /**
   * Initial activities to seed the tracker. Canonical name in 3.13+.
   * Takes precedence over `initialActivities` if both are set.
   */
  initialData?: ProcessingActivity[];

  /**
   * @deprecated Renamed to `initialData`. Will be removed in 4.0.
   * If both are set, `initialData` wins.
   */
  initialActivities?: ProcessingActivity[];

  adapter?: StorageAdapter<ProcessingActivity[]>;
  classNames?: LawfulBasisTrackerClassNames;
  unstyled?: boolean;

  /**
   * UX copy overrides — see {@link NDPRLawfulBasisCopy}.
   */
  copy?: NDPRLawfulBasisCopy;
}

export const NDPRLawfulBasis: React.FC<NDPRLawfulBasisProps> = ({
  initialData,
  initialActivities,
  adapter,
  classNames,
  unstyled,
  copy,
}) => {
  // Dev-only deprecation warning: `initialActivities` is the 3.x name;
  // `initialData` is the canonical 3.13+ name. Fire-once per instance.
  const warnedInitialActivitiesRef = useRef(false);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      initialActivities !== undefined &&
      initialData === undefined &&
      !warnedInitialActivitiesRef.current
    ) {
      warnedInitialActivitiesRef.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        "[ndpr-toolkit/lawful-basis] NDPRLawfulBasisProps.initialActivities is deprecated; rename to 'initialData'. Will be removed in 4.0.",
      );
    }
  }, [initialActivities, initialData]);

  const resolvedInitial: ProcessingActivity[] = initialData ?? initialActivities ?? [];

  // Synchronous seed: only honoured for sync adapters (localStorage,
  // memory). Async adapters (cookie, api) return a Promise which we ignore
  // here and rehydrate via the effect below.
  const [activities, setActivities] = useState<ProcessingActivity[]>(() => {
    if (adapter) {
      const saved = adapter.load();
      if (saved && !(saved instanceof Promise)) return saved;
    }
    return resolvedInitial;
  });

  // Async hydrate: covers cookieAdapter / apiAdapter / any adapter that
  // returns a Promise. Mirrors the pattern used by NDPRROPA. Without this
  // pass, async-stored activities never seeded after mount.
  useEffect(() => {
    if (!adapter) return;
    let cancelled = false;
    void (async () => {
      try {
        const saved = await adapter.load();
        if (!cancelled && saved) setActivities(saved);
      } catch {
        // Adapter failure shouldn't break the UI — keep the in-memory state.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  const persist = (updated: ProcessingActivity[]) => {
    if (adapter) adapter.save(updated);
  };

  const handleAddActivity = (
    activityData: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = Date.now();
    const newActivity: ProcessingActivity = {
      ...activityData,
      id: `activity-${now}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...activities, newActivity];
    setActivities(updated);
    persist(updated);
  };

  const handleUpdateActivity = (id: string, updates: Partial<ProcessingActivity>) => {
    const updated = activities.map(a =>
      a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
    );
    setActivities(updated);
    persist(updated);
  };

  const handleArchiveActivity = (id: string) => {
    const updated = activities.map(a =>
      a.id === id ? { ...a, status: 'inactive' as const, updatedAt: Date.now() } : a
    );
    setActivities(updated);
    persist(updated);
  };

  return (
    <LawfulBasisTracker
      activities={activities}
      onAddActivity={handleAddActivity}
      onUpdateActivity={handleUpdateActivity}
      onArchiveActivity={handleArchiveActivity}
      classNames={classNames}
      unstyled={unstyled}
      title={copy?.title}
      description={copy?.description}
    />
  );
};
