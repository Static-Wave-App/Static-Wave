import { useNetwork } from "@/stores";

type NetworkStatus = {
  isConnected: boolean;
  isLoading: boolean;
};

export function useNetworkStatus(): NetworkStatus {
  const isConnected = useNetwork((s) => s.isConnected);
  const isLoading = useNetwork((s) => s.isLoading);
  return { isConnected, isLoading };
}