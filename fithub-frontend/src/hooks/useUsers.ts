import { useQuery } from "@tanstack/react-query";
import { loadUsers } from "../api/users";
import { type User } from "../types/User";

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: loadUsers,
  });
}
