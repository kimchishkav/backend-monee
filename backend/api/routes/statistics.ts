import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { month, accountId } = req.query as { month?: string; accountId?: string };
  const [year, mon] = (month ?? new Date().toISOString().slice(0, 7)).split("-").map(Number);

  const startOfMonth = new Date(year, mon - 1, 1);
  const endOfMonth = new Date(year, mon, 0, 23, 59, 59);

  const where: Record<string, unknown> = {
    userId: req.userId!,
    date: { gte: startOfMonth, lte: endOfMonth },
  };
  if (accountId && accountId !== "ALL") where.accountId = parseInt(accountId);

  const transactions = await prisma.transaction.findMany({ where });

  const expenses = transactions.filter((t) => t.type === "EXPENSE");
  const income = transactions.filter((t) => t.type === "INCOME");

  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((t) => {
    const cat = t.category ?? "OTHER";
    expensesByCategory[cat] = (expensesByCategory[cat] ?? 0) + Number(t.amount);
  });

  const incomeByCategory: Record<string, number> = {};
  income.forEach((t) => {
    const cat = t.category ?? "OTHER_INCOME";
    incomeByCategory[cat] = (incomeByCategory[cat] ?? 0) + Number(t.amount);
  });

  const trend: { month: string; expenses: number; income: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, mon - 1 - i, 1);
    const tYear = d.getFullYear();
    const tMon = d.getMonth() + 1;
    const start = new Date(tYear, tMon - 1, 1);
    const end = new Date(tYear, tMon, 0, 23, 59, 59);
    const monthLabel = `${tYear}-${String(tMon).padStart(2, "0")}`;

    const monthTx = await prisma.transaction.findMany({
      where: { userId: req.userId!, date: { gte: start, lte: end } },
    });
    trend.push({
      month: monthLabel,
      expenses: monthTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0),
      income: monthTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0),
    });
  }

  res.json({
    totalExpenses: expenses.reduce((s, t) => s + Number(t.amount), 0),
    totalIncome: income.reduce((s, t) => s + Number(t.amount), 0),
    expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({ category, amount })),
    incomeByCategory: Object.entries(incomeByCategory).map(([category, amount]) => ({ category, amount })),
    monthlyTrend: trend,
  });
});

export default router;
