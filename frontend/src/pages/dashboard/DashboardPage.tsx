import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/StatCard";
import { TransactionRow } from "../../components/TransactionRow";
import { AddTransactionModal } from "../../components/AddTransactionModal";
import { MonthSelect, currentMonth } from "../../components/ui/MonthSelect";
import { getDashboard } from "../../api/dashboard";
import { ACCOUNT_TYPE_LABELS, formatMoney } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";
import type { DashboardData } from "../../types";

export function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const currency = user?.currency ?? "RUB";

  function reload() {
    setLoading(true);
    getDashboard(month)
      .then(setData)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  if (loading || !data) {
    return <div className="text-gray-400 dark:text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Привет, {user?.name}! 💕</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Вот обзор ваших финансов на сегодня</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Добавить операцию</Button>
      </div>

      {data.limitExceeded && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          ⚠️ Вы превысили месячный лимит расходов
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<span>👛</span>}
          iconBg="bg-brand-100"
          label="Общий баланс"
          value={formatMoney(data.totalBalance, currency)}
          hint={data.balanceChangePercent != null ? `${data.balanceChangePercent > 0 ? "↑" : "↓"} ${Math.abs(data.balanceChangePercent)}% с прошлого месяца` : undefined}
          hintPositive={(data.balanceChangePercent ?? 0) >= 0}
        />
        <StatCard
          icon={<span>🏦</span>}
          iconBg="bg-violet-100"
          label="На счетах"
          value={formatMoney(data.accountsBalance, currency)}
          hint={`${data.accountsCount} ${data.accountsCount === 1 ? "счет" : "счета"}`}
          hintPositive
        />
        <StatCard
          icon={<span>🔒</span>}
          iconBg="bg-violet-100"
          label="На депозитах"
          value={formatMoney(data.depositsBalance, currency)}
          hint={`${data.depositsCount} ${data.depositsCount === 1 ? "депозит" : "депозита"}`}
          hintPositive
        />
        {data.frozenCount > 0 && (
          <StatCard
            icon={<span>🔐</span>}
            iconBg="bg-violet-100"
            label="Заморожено"
            value={formatMoney(data.frozenBalance, currency)}
            hint={`${data.frozenCount} ${data.frozenCount === 1 ? "счет" : "счета"} · не в балансе`}
            hintPositive={false}
          />
        )}
        <StatCard
          icon={<span>📉</span>}
          iconBg="bg-brand-100"
          label="Расходы за месяц"
          value={formatMoney(data.monthlyExpenses, currency)}
          hint={data.expensesChangePercent != null ? `${data.expensesChangePercent > 0 ? "↑" : "↓"} ${Math.abs(data.expensesChangePercent)}% с прошлого месяца` : undefined}
          hintPositive={(data.expensesChangePercent ?? 0) <= 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Динамика расходов</h2>
            <MonthSelect value={month} onChange={setMonth} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.expensesChart}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).getDate().toString()}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                interval={Math.ceil(data.expensesChart.length / 6)}
              />
              <Tooltip
                formatter={(value) => formatMoney(Number(value), currency)}
                labelFormatter={(d) => new Date(d).toLocaleDateString("ru-RU")}
              />
              <Area type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2} fill="url(#expenseGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Последние операции</h2>
            <Link to="/transactions" className="text-sm font-medium text-brand-500 hover:text-brand-600">
              Все операции →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {data.recentTransactions.length === 0 && <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Операций пока нет</p>}
            {data.recentTransactions.map((t) => (
              <TransactionRow key={t.id} transaction={t} currency={currency} />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Мои счета</h2>
          <Link to="/accounts" className="text-sm font-medium text-brand-500 hover:text-brand-600">
            Все счета →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.accounts.length === 0 && <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Счетов пока нет</p>}
          {data.accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{ACCOUNT_TYPE_LABELS[a.type]}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatMoney(a.balance, currency)}</p>
            </div>
          ))}
        </div>
      </Card>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} accounts={data.accounts} onCreated={reload} />
    </div>
  );
}
