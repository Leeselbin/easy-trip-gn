import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BUS_STOPS = [
  {
    id: "stop-1",
    name: "강릉역",
    latitude: 37.7634,
    longitude: 128.8995,
    arrivals: [
      { routeName: "202", arrivalMinutes: 3, isLowFloor: true },
      { routeName: "300", arrivalMinutes: 11, isLowFloor: false },
      { routeName: "101", arrivalMinutes: 13, isLowFloor: false },
      { routeName: "230", arrivalMinutes: 18, isLowFloor: true },
      { routeName: "310", arrivalMinutes: 22, isLowFloor: false },
    ],
  },
  {
    id: "stop-2",
    name: "강릉시청",
    latitude: 37.7519,
    longitude: 128.8961,
    arrivals: [
      { routeName: "101", arrivalMinutes: 5, isLowFloor: false },
      { routeName: "202", arrivalMinutes: 14, isLowFloor: true },
    ],
  },
  {
    id: "stop-3",
    name: "경포해변",
    latitude: 37.8053,
    longitude: 128.9086,
    arrivals: [
      { routeName: "300", arrivalMinutes: 2, isLowFloor: true },
      { routeName: "310", arrivalMinutes: 9, isLowFloor: true },
    ],
  },
  {
    id: "stop-4",
    name: "강릉터미널",
    latitude: 37.7486,
    longitude: 128.8772,
    arrivals: [
      { routeName: "101", arrivalMinutes: 7, isLowFloor: false },
      { routeName: "230", arrivalMinutes: 16, isLowFloor: false },
    ],
  },
  {
    id: "stop-5",
    name: "강릉아산병원",
    latitude: 37.7715,
    longitude: 128.8769,
    arrivals: [
      { routeName: "202", arrivalMinutes: 6, isLowFloor: true },
      { routeName: "230", arrivalMinutes: 12, isLowFloor: false },
    ],
  },
];

const RESTAURANTS = [
  { id: "restaurant-1", name: "강릉커피거리 맛집", latitude: 37.7715, longitude: 128.9415 },
  { id: "restaurant-2", name: "교동반점", latitude: 37.7589, longitude: 128.8967 },
  { id: "restaurant-3", name: "초당순두부마을", latitude: 37.7868, longitude: 128.9221 },
  { id: "restaurant-4", name: "중앙시장 닭강정", latitude: 37.7515, longitude: 128.8987 },
];

const TOURIST_SPOTS = [
  { id: "tour-1", name: "경포해변", latitude: 37.8053, longitude: 128.9086 },
  { id: "tour-2", name: "오죽헌", latitude: 37.7766, longitude: 128.8898 },
  { id: "tour-3", name: "안목해변 커피거리", latitude: 37.7719, longitude: 128.9426 },
  { id: "tour-4", name: "정동진역", latitude: 37.6906, longitude: 129.0339 },
];

async function main() {
  for (const stop of BUS_STOPS) {
    await prisma.busStop.upsert({
      where: { id: stop.id },
      update: {},
      create: {
        id: stop.id,
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        arrivals: { create: stop.arrivals },
      },
    });
  }

  for (const restaurant of RESTAURANTS) {
    await prisma.restaurant.upsert({
      where: { id: restaurant.id },
      update: {},
      create: restaurant,
    });
  }

  for (const spot of TOURIST_SPOTS) {
    await prisma.touristSpot.upsert({
      where: { id: spot.id },
      update: {},
      create: spot,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
