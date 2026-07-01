import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();
router.use(authMiddleware);

function userResponse(user: {
  id: number; name: string; email: string; currency: string;
  monthlyLimit: unknown; theme: string; avatar: string | null; createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    monthlyLimit: user.monthlyLimit,
    theme: user.theme,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

router.get("/", async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  res.json(userResponse(user));
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  currency: z.string().optional(),
  monthlyLimit: z.number().nullable().optional(),
  theme: z.enum(["LIGHT", "DARK"]).optional(),
  avatar: z.string().nullable().optional(),
  removeAvatar: z.boolean().optional(),
});

router.put("/", async (req: AuthRequest, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }
  const { name, currency, monthlyLimit, theme, avatar, removeAvatar } = parsed.data;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (currency !== undefined) data.currency = currency;
  if (monthlyLimit !== undefined) data.monthlyLimit = monthlyLimit;
  if (theme !== undefined) data.theme = theme;
  if (removeAvatar) data.avatar = null;
  else if (avatar !== undefined) data.avatar = avatar;

  const user = await prisma.user.update({ where: { id: req.userId! }, data });
  res.json(userResponse(user));
});

export default router;
