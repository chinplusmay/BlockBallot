import { create } from 'zustand';

export const ElectionStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  ENDED: 'ended',
};

const initialState = {
  elections: [],
  currentElection: null,
  isLoading: false,
  error: null,
};

export const useElectionStore = create((set) => ({
  ...initialState,

  setElections: (elections) => set({ elections }),

  setCurrentElection: (currentElection) => set({ currentElection }),

  addElection: (election) =>
    set((state) => ({
      elections: [...state.elections, election],
    })),

  updateElection: (id, updates) =>
    set((state) => ({
      elections: state.elections.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
      currentElection:
        state.currentElection?.id === id
          ? { ...state.currentElection, ...updates }
          : state.currentElection,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

// Helper to compute election status from timestamps
export function computeElectionStatus(startTime, endTime) {
  const now = Math.floor(Date.now() / 1000);
  if (now < startTime) return ElectionStatus.PENDING;
  if (now > endTime) return ElectionStatus.ENDED;
  return ElectionStatus.ACTIVE;
}
