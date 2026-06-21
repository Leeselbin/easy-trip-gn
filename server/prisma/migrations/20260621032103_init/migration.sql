-- CreateTable
CREATE TABLE "BusStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "BusArrival" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "routeName" TEXT NOT NULL,
    "arrivalMinutes" INTEGER NOT NULL,
    "isLowFloor" BOOLEAN NOT NULL,
    "busStopId" TEXT NOT NULL,
    CONSTRAINT "BusArrival_busStopId_fkey" FOREIGN KEY ("busStopId") REFERENCES "BusStop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
