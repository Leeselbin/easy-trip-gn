import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const restaurantsRouter = Router();

restaurantsRouter.get("/", async (_req, res) => {
  const restaurants = await prisma.restaurant.findMany();
  res.json(restaurants);
});
