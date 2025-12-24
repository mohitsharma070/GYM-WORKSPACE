import { useQuery } from "@tanstack/react-query";
import { fetchMembersPage } from "../api/users";
import type { PageRequest, PageResponse } from "../types/Page";
import { type User } from "../types/User";

export function useUsers(params: PageRequest = {}) {
  return useQuery<PageResponse<User>, Error>({
    queryKey: ["users", params],
    queryFn: () => fetchMembersPage(params),
  });
}
