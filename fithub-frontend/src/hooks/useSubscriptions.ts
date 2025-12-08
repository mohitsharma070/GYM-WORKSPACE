import { useState } from "react";
import { subscribeToPlan } from "../api/subscriptions";

export function useSubscriptions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (userId: number, planId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await subscribeToPlan(userId, planId);
      return result;
    } catch (err: any) {
      setError(err.message || "An error occurred during subscription.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading, error };
}
