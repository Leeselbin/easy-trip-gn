import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const usersRouter = Router();

usersRouter.post("/kakao", async (req, res) => {
  const { kakaoId, nickname, profileImageUrl } = req.body ?? {};
  if (!kakaoId) {
    res.status(400).json({ error: "kakaoId is required" });
    return;
  }

  const user = await prisma.user.upsert({
    where: { kakaoId: String(kakaoId) },
    update: { nickname, profileImageUrl },
    create: { kakaoId: String(kakaoId), nickname, profileImageUrl },
  });

  res.json(user);
});
