import { useQuery } from "@tanstack/react-query";

import { fetchRestaurants } from "@/lib/api";

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });
}
