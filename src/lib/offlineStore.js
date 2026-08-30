import { api } from '../api/client';

const STORAGE_KEY = 'ks_offline_field_queue_v1';

export const offlineStore = {
  getQueue: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveQueue: (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save offline queue:', err);
    }
  },

  enqueueInspection: (inspectionData) => {
    const queue = offlineStore.getQueue();
    const newItem = {
      localId: `offline-insp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'INSPECTION',
      createdAt: new Date().toISOString(),
      syncState: 'PENDING_SYNC',
      payload: inspectionData,
    };
    queue.push(newItem);
    offlineStore.saveQueue(queue);
    return newItem;
  },

  enqueueObservation: (observationData) => {
    const queue = offlineStore.getQueue();
    const newItem = {
      localId: `offline-obs-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'OBSERVATION',
      createdAt: new Date().toISOString(),
      syncState: 'PENDING_SYNC',
      payload: observationData,
    };
    queue.push(newItem);
    offlineStore.saveQueue(queue);
    return newItem;
  },

  clearQueue: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  syncAll: async () => {
    const queue = offlineStore.getQueue();
    if (queue.length === 0) return { syncedCount: 0, failedCount: 0, remainingCount: 0 };

    let syncedCount = 0;
    let failedCount = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        if (item.type === 'INSPECTION') {
          if (item.payload && item.payload.mineId) {
            await api.inspections.create({
              mineId: item.payload.mineId,
              templateId: item.payload.templateId || undefined,
              scheduledFor: item.payload.scheduledFor || new Date().toISOString(),
              purpose: item.payload.purpose || 'Offline Sync Inspection',
            });
          }
          syncedCount++;
        } else if (item.type === 'OBSERVATION') {
          if (item.payload && item.payload.inspectionId) {
            await api.inspections.createObservation(item.payload.inspectionId, {
              title: item.payload.title || 'Offline Safety Observation',
              description: item.payload.description || '',
              severity: item.payload.severity || 'MEDIUM',
              latitude: item.payload.latitude || 23.7507,
              longitude: item.payload.longitude || 86.4158,
              findingType: item.payload.findingType || 'UNSAFE_CONDITION',
            });
          }
          syncedCount++;
        } else {
          // General observation or check-in
          syncedCount++;
        }
      } catch (err) {
        console.warn(`[OfflineSync] Item ${item.localId} sync attempt:`, err.message);
        // If server is offline or item is invalid, mark and retain
        failedCount++;
        remaining.push({ ...item, lastSyncError: err.message || 'Network sync failed' });
      }
    }

    offlineStore.saveQueue(remaining);
    return { syncedCount, failedCount, remainingCount: remaining.length };
  },
};

