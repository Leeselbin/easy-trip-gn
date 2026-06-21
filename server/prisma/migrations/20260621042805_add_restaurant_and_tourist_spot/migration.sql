-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "TouristSpot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);
