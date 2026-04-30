import { useState, useEffect, useCallback } from "react";
import { getRecordsByUser } from "../lib/firestore";
import { useAuth } from "./useAuth";
import type { FlowerRecord } from "../types";

export function useRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<FlowerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRecords([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getRecordsByUser(user.uid);
      setRecords(data);
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, isLoading, refresh };
}
