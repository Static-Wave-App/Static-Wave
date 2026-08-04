import { useEffect, useState } from "react";
import * as Network from "expo-network";

type NetworkStatus = {
  isConnected: boolean;
  isLoading: boolean;
};

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const state = await Network.getNetworkStateAsync();
      if (mounted) {
        setIsConnected(state.isConnected ?? true);
        setIsLoading(false);
      }
    }

    check();

    const subscription = Network.addNetworkStateListener((state) => {
      if (mounted) {
        setIsConnected(state.isConnected ?? true);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return { isConnected, isLoading };
}