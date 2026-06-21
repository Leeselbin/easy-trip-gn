export type BusArrival = {
  routeName: string;
  arrivalMinutes: number;
  isLowFloor: boolean;
};

export type BusStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  arrivals: BusArrival[];
};
