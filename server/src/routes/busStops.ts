import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const busStopsRouter = Router();

busStopsRouter.get("/", async (_req, res) => {
  const busStops = await prisma.busStop.findMany({ include: { arrivals: true } });
  res.json(busStops);
});
