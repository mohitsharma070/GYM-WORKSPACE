import { useQuery } from '@tanstack/react-query';
import { fetchAllPlans } from '../api/plans';

export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: fetchAllPlans });
}
