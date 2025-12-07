import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAddress } from '@/lib/wagmi-config';

const initialState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  isAdmin: false,
};

export const useWalletStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setAddress: (address) =>
        set({
          address,
          isAdmin:
            !!address &&
            !!adminAddress &&
            address.toLowerCase() === adminAddress.toLowerCase(),
        }),

      setConnected: (isConnected) => set({ isConnected }),

      setConnecting: (isConnecting) => set({ isConnecting }),

      setChainId: (chainId) => set({ chainId }),

      reset: () => set(initialState),
    }),
    {
      name: 'wallet-store',
      partialize: (state) => ({
        // Only persist necessary fields
        address: state.address,
      }),
    }
  )
);
