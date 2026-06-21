import { useQuery } from "@tanstack/react-query";

import { fetchBusStops } from "@/lib/api";

export function useBusStops() {
  return useQuery({
    queryKey: ["busStops"],
    queryFn: fetchBusStops,
  });
}
