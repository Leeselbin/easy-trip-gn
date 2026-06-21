import type { BusStop } from "@/constants/busStops";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchBusStops(): Promise<BusStop[]> {
  const response = await fetch(`${API_BASE_URL}/api/bus-stops`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bus stops: ${response.status}`);
  }
  return response.json();
}
