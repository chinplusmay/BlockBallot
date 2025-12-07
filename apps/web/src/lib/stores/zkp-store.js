import { create } from 'zustand';

export const ProofGenerationStep = {
  IDLE: 'idle',
  LOADING_CIRCUIT: 'loading_circuit',
  GENERATING_IDENTITY: 'generating_identity',
  COMPUTING_MERKLE: 'computing_merkle',
  GENERATING_PROOF: 'generating_proof',
  SUBMITTING: 'submitting',
  COMPLETE: 'complete',
  ERROR: 'error',
};

const initialState = {
  currentStep: ProofGenerationStep.IDLE,
  progress: 0,
  error: null,
  proofData: null,
  isCircuitLoaded: false,
  circuitLoadProgress: 0,
};

export const useZKPStore = create((set) => ({
  ...initialState,

  setStep: (currentStep) => set({ currentStep }),

  setProgress: (progress) => set({ progress }),

  setError: (error) =>
    set({
      error,
      currentStep: error ? ProofGenerationStep.ERROR : ProofGenerationStep.IDLE,
    }),

  setProofData: (proofData) => set({ proofData }),

  setCircuitLoaded: (isCircuitLoaded) => set({ isCircuitLoaded }),

  setCircuitLoadProgress: (circuitLoadProgress) => set({ circuitLoadProgress }),

  reset: () => set(initialState),
}));

// Step descriptions for UI
export const stepDescriptions = {
  [ProofGenerationStep.IDLE]: 'Ready to generate proof',
  [ProofGenerationStep.LOADING_CIRCUIT]: 'Loading ZK circuit...',
  [ProofGenerationStep.GENERATING_IDENTITY]: 'Generating identity commitment...',
  [ProofGenerationStep.COMPUTING_MERKLE]: 'Computing Merkle proof...',
  [ProofGenerationStep.GENERATING_PROOF]: 'Generating zero-knowledge proof...',
  [ProofGenerationStep.SUBMITTING]: 'Submitting vote to blockchain...',
  [ProofGenerationStep.COMPLETE]: 'Vote submitted successfully!',
  [ProofGenerationStep.ERROR]: 'An error occurred',
};
