import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const touristSpotsRouter = Router();

touristSpotsRouter.get("/", async (_req, res) => {
  const touristSpots = await prisma.touristSpot.findMany();
  res.json(touristSpots);
});
