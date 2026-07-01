import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { Category, TransactionType } from "@prisma/client";

const router = Router();
router.use(authMiddleware);

function txResponse(t: {
  id: number; type: string; amount: unknown; category: string | null;
  accountId: number; account: { name: string };
  toAccountId: number | null; toAccount: { name: string } | null;
  date: Date; description: string | null;
}) {
  return {
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    category: t.category,
    accountId: t.accountId,
    accountName: t.account.name,
    toAccountId: t.toAccountId,
    toAccountName: t.toAccount?.name ?? null,
    date: t.date.toISOString().split("T")[0],
    description: t.description,
  };
}

const include = {
  account: { select: { name: true } },
  toAccount: { select: { name: true } },
} as const;

router.get("/", async (req: AuthRequest, res: Response) => {
  const { type, category, accountId, from, to } = req.query;

  const where: Record<string, unknown> = { userId: req.userId! };
  if (type) where.type = type as TransactionType;
  if (category) where.category = category as Category;
  if (accountId) where.accountId = parseInt(accountId as string);
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from as string) } : {}),
      ...(to ? { lte: new Date(to as string) } : {}),
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  res.json(transactions.map(txResponse));
});

const txSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive(),
  category: z.nativeEnum(Category).nullable().optional(),
  accountId: z.number(),
  toAccountId: z.number().nullable().optional(),
  date: z.string(),
  description: z.string().nullable().optional(),
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = txSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Неверные данные" }); return; }

  const { type, amount, category, accountId, toAccountId, date, description } = parsed.data;

  const account = await prisma.account.findFirst({ where: { id: accountId, userId: req.userId! } });
  if (!account) { res.status(404).json({ message: "Счет не найден" }); return; }

  if (type === "TRANSFER") {
    if (!toAccountId) { res.status(400).json({ message: "Укажите счет назначения" }); return; }
    const toAccount = await prisma.account.findFirst({ where: { id: toAccountId, userId: req.userId! } });
    if (!toAccount) { res.status(404).json({ message: "Счет назначения не найден" }); return; }

    const [tx] = await prisma.$transaction([
      prisma.transaction.create({
        data: { userId: req.userId!, accountId, toAccountId, type, amount, date: new Date(date), description: description ?? null, category: null },
        include,
      }),
      prisma.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } }),
      prisma.account.update({ where: { id: toAccountId }, data: { balance: { increment: amount } } }),
    ]);
    res.status(201).json(txResponse(tx));
    return;
  }

  const balanceDelta = type === "INCOME" ? amount : -amount;
  const [tx] = await prisma.$transaction([
    prisma.transaction.create({
      data: { userId: req.userId!, accountId, type, amount, category: category ?? null, date: new Date(date), description: description ?? null },
      include,
    }),
    prisma.account.update({ where: { id: accountId }, data: { balance: { increment: balanceDelta } } }),
  ]);
  res.status(201).json(txResponse(tx));
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const tx = await prisma.transaction.findFirst({ where: { id, userId: req.userId! } });
  if (!tx) { res.status(404).json({ message: "Операция не найдена" }); return; }

  const ops: Parameters<typeof prisma.$transaction>[0] = [
    prisma.transaction.delete({ where: { id } }),
  ];

  if (tx.type === "TRANSFER" && tx.toAccountId) {
    ops.push(prisma.account.update({ where: { id: tx.accountId }, data: { balance: { increment: tx.amount } } }));
    ops.push(prisma.account.update({ where: { id: tx.toAccountId }, data: { balance: { decrement: tx.amount } } }));
  } else if (tx.type === "INCOME") {
    ops.push(prisma.account.update({ where: { id: tx.accountId }, data: { balance: { decrement: tx.amount } } }));
  } else if (tx.type === "EXPENSE") {
    ops.push(prisma.account.update({ where: { id: tx.accountId }, data: { balance: { increment: tx.amount } } }));
  }

  await prisma.$transaction(ops);
  res.status(204).send();
});

export default router;
