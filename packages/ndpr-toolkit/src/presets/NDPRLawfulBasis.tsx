import React, { useState } from 'react';
import { LawfulBasisTracker } from '../components/lawful-basis/LawfulBasisTracker';
import type { LawfulBasisTrackerClassNames } from '../components/lawful-basis/LawfulBasisTracker';
import type { ProcessingActivity } from '../types/lawful-basis';
import type { StorageAdapter } from '../adapters/types';

export interface NDPRLawfulBasisProps {
  initialActivities?: ProcessingActivity[];
  adapter?: StorageAdapter<ProcessingActivity[]>;
  classNames?: LawfulBasisTrackerClassNames;
  unstyled?: boolean;
}

export const NDPRLawfulBasis: React.FC<NDPRLawfulBasisProps> = ({
  initialActivities = [],
  adapter,
  classNames,
  unstyled,
}) => {
  const [activities, setActivities] = useState<ProcessingActivity[]>(() => {
    if (adapter) {
      const saved = adapter.load();
      if (saved && !(saved instanceof Promise)) return saved;
    }
    return initialActivities;
  });

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
    />
  );
};
