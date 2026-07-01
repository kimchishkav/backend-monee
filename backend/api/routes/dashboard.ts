import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { month } = req.query as { month?: string };
  const [year, mon] = (month ?? new Date().toISOString().slice(0, 7)).split("-").map(Number);

  const startOfMonth = new Date(year, mon - 1, 1);
  const endOfMonth = new Date(year, mon, 0, 23, 59, 59);
  const startOfPrevMonth = new Date(year, mon - 2, 1);
  const endOfPrevMonth = new Date(year, mon - 1, 0, 23, 59, 59);

  const [accounts, monthTransactions, prevMonthTransactions] = await Promise.all([
    prisma.account.findMany({ where: { userId: req.userId! }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: { userId: req.userId!, date: { gte: startOfMonth, lte: endOfMonth } },
      include: { account: { select: { name: true } }, toAccount: { select: { name: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.transaction.findMany({
      where: { userId: req.userId!, date: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
    }),
  ]);

  const activeAccounts = accounts.filter((a) => a.status === "ACTIVE");
  const frozenAccounts = accounts.filter((a) => a.status === "FROZEN");

  const totalBalance = activeAccounts.reduce((s, a) => s + Number(a.balance), 0);
  const frozenBalance = frozenAccounts.reduce((s, a) => s + Number(a.balance), 0);

  const nonDeposit = activeAccounts.filter((a) => a.type !== "DEPOSIT");
  const deposits = activeAccounts.filter((a) => a.type === "DEPOSIT");

  const accountsBalance = nonDeposit.reduce((s, a) => s + Number(a.balance), 0);
  const depositsBalance = deposits.reduce((s, a) => s + Number(a.balance), 0);

  const expenses = monthTransactions.filter((t) => t.type === "EXPENSE");
  const income = monthTransactions.filter((t) => t.type === "INCOME");

  const monthlyExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const monthlyIncome = income.reduce((s, t) => s + Number(t.amount), 0);

  const prevExpenses = prevMonthTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);
  const prevIncome = prevMonthTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);

  const expensesChangePercent = prevExpenses > 0
    ? Math.round(((monthlyExpenses - prevExpenses) / prevExpenses) * 100)
    : null;
  const incomeChangePercent = prevIncome > 0
    ? Math.round(((monthlyIncome - prevIncome) / prevIncome) * 100)
    : null;
  const balanceChangePercent = prevIncome > 0 || prevExpenses > 0
    ? Math.round((((monthlyIncome - monthlyExpenses) - (prevIncome - prevExpenses)) / Math.max(prevIncome, prevExpenses)) * 100)
    : null;

  const daysInMonth = endOfMonth.getDate();
  const dailyExpenses: Record<string, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dailyExpenses[key] = 0;
  }
  expenses.forEach((t) => {
    const key = t.date.toISOString().split("T")[0];
    if (key in dailyExpenses) dailyExpenses[key] += Number(t.amount);
  });
  const expensesChart = Object.entries(dailyExpenses).map(([date, amount]) => ({ date, amount }));

  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
  const limitExceeded = user.monthlyLimit != null && monthlyExpenses > Number(user.monthlyLimit);

  const recentTransactions = monthTransactions.slice(0, 5).map((t) => ({
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
  }));

  res.json({
    totalBalance,
    frozenBalance,
    frozenCount: frozenAccounts.length,
    accountsBalance,
    accountsCount: nonDeposit.length,
    depositsBalance,
    depositsCount: deposits.length,
    monthlyExpenses,
    monthlyIncome,
    expensesChangePercent,
    incomeChangePercent,
    balanceChangePercent,
    limitExceeded,
    expensesChart,
    recentTransactions,
    accounts: activeAccounts.map((a) => ({
      id: a.id, name: a.name, type: a.type, balance: Number(a.balance), status: a.status, notes: a.notes,
    })),
  });
});

export default router;
