import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { AccountStatus, AccountType, TransactionType } from "@prisma/client";

const router = Router();
router.use(authMiddleware);

const accountSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(AccountType),
  balance: z.number(),
  status: z.nativeEnum(AccountStatus).optional(),
  notes: z.string().nullable().optional(),
});

function accountResponse(a: {
  id: number; name: string; type: string; balance: unknown; status: string; notes: string | null;
}) {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    balance: Number(a.balance),
    status: a.status,
    notes: a.notes,
  };
}

router.get("/", async (req: AuthRequest, res: Response) => {
  const accounts = await prisma.account.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "asc" },
  });
  res.json(accounts.map(accountResponse));
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = accountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Неверные данные" });
    return;
  }
  const { name, type, balance, status, notes } = parsed.data;
  const account = await prisma.account.create({
    data: {
      userId: req.userId!,
      name,
      type,
      balance,
      status: status ?? "ACTIVE",
      notes: notes ?? null,
    },
  });
  res.status(201).json(accountResponse(account));
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.account.findFirst({ where: { id, userId: req.userId! } });
  if (!existing) { res.status(404).json({ message: "Счет не найден" }); return; }

  const parsed = accountSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Неверные данные" }); return; }

  const { name, type, balance, status, notes } = parsed.data;
  const account = await prisma.account.update({
    where: { id },
    data: { name, type, balance, status: status ?? existing.status, notes: notes ?? null },
  });
  res.json(accountResponse(account));
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.account.findFirst({ where: { id, userId: req.userId! } });
  if (!existing) { res.status(404).json({ message: "Счет не найден" }); return; }

  await prisma.transaction.deleteMany({ where: { OR: [{ accountId: id }, { toAccountId: id }] } });
  await prisma.account.delete({ where: { id } });
  res.status(204).send();
});

router.post("/:id/unfreeze", async (req: AuthRequest, res: Response) => {
  const frozenId = parseInt(req.params.id);
  const { toAccountId } = req.body as { toAccountId: number };

  const frozen = await prisma.account.findFirst({
    where: { id: frozenId, userId: req.userId!, status: "FROZEN" },
  });
  if (!frozen) { res.status(404).json({ message: "Замороженный счет не найден" }); return; }

  const target = await prisma.account.findFirst({
    where: { id: toAccountId, userId: req.userId!, status: "ACTIVE" },
  });
  if (!target) { res.status(404).json({ message: "Целевой счет не найден" }); return; }

  const [, updatedFrozen] = await prisma.$transaction([
    prisma.account.update({
      where: { id: toAccountId },
      data: { balance: { increment: frozen.balance } },
    }),
    prisma.account.update({
      where: { id: frozenId },
      data: { balance: 0, status: "ACTIVE" },
    }),
    prisma.transaction.create({
      data: {
        userId: req.userId!,
        accountId: frozenId,
        toAccountId: toAccountId,
        type: TransactionType.TRANSFER,
        amount: frozen.balance,
        date: new Date(),
        description: `Разморозка: ${frozen.name} → ${target.name}`,
      },
    }),
  ]);

  res.json(accountResponse(updatedFrozen));
});

export default router;
