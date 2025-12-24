import { useQuery } from '@tanstack/react-query';
import { loadPlan } from '../api/subscriptions';

export function useMemberPlan(memberId?: number) {
  return useQuery({
    queryKey: ['member-plan', memberId],
    queryFn: () => (memberId ? loadPlan(memberId) : Promise.resolve(null)),
    enabled: !!memberId,
  });
}
