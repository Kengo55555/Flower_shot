import { useState, useEffect, useCallback } from "react";
import { checkCanUse } from "../lib/usage-limit";
import { useAuth } from "./useAuth";

export function useUsageLimit() {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [userRemaining, setUserRemaining] = useState(30);
  const [globalCount, setGlobalCount] = useState(0);
  const [canUse, setCanUse] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await checkCanUse(user.uid);
      setUserCount(result.userCount);
      setUserRemaining(result.userRemaining);
      setGlobalCount(result.globalCount);
      setCanUse(result.canUse);
    } catch (err) {
      console.error("Failed to check usage:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { userCount, userRemaining, globalCount, canUse, isLoading, refresh };
}
