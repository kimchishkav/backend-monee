import { useEffect, useState } from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, PieChart, Pie, Cell } from "recharts";
import { Card } from "../../components/ui/Card";
import { Dropdown } from "../../components/ui/Dropdown";
import { MonthSelect, currentMonth } from "../../components/ui/MonthSelect";
import { getStatistics } from "../../api/statistics";
import { getAccounts } from "../../api/accounts";
import { CATEGORY_COLORS, CATEGORY_LABELS, formatMoney } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";
import type { Account, StatisticsData } from "../../types";

export function StatisticsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? "RUB";

  const [month, setMonth] = useState(currentMonth());
  const [accountId, setAccountId] = useState<string>("ALL");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    setLoading(true);
    getStatistics(month, accountId === "ALL" ? undefined : Number(accountId))
      .then(setData)
      .finally(() => setLoading(false));
  }, [month, accountId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Статистика</h1>
        <div className="flex flex-wrap gap-2">
          <Dropdown
            value={accountId}
            onChange={setAccountId}
            className="w-auto min-w-[160px]"
            options={[{ value: "ALL", label: "Все счета" }, ...accounts.map((a) => ({ value: String(a.id), label: a.name }))]}
          />
          <MonthSelect value={month} onChange={setMonth} />
        </div>
      </div>

      {loading || !data ? (
        <p className="text-gray-400 dark:text-gray-500">Загрузка...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Доходы за месяц</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-500">{formatMoney(data.totalIncome, currency)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Расходы за месяц</p>
              <p className="mt-2 text-2xl font-semibold text-red-500">{formatMoney(data.totalExpense, currency)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Остаток</p>
              <p className={`mt-2 text-2xl font-semibold ${data.balance >= 0 ? "text-gray-900 dark:text-gray-100" : "text-red-500"}`}>
                {formatMoney(data.balance, currency)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Расходы по категориям</h2>
              {data.categories.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">Нет расходов за этот период</p>
              ) : (
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <ResponsiveContainer width="100%" height={220} className="sm:max-w-[220px]">
                    <PieChart>
                      <Pie
                        data={data.categories}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {data.categories.map((c) => (
                          <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMoney(Number(value), currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-2">
                    {data.categories.map((c) => (
                      <div key={c.category} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.category] }} />
                          {CATEGORY_LABELS[c.category]}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatMoney(c.amount, currency)}</span>
                        <span className="w-12 text-right text-gray-400 dark:text-gray-500">{c.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.topCategory && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Самая большая категория: <span className="font-medium text-gray-900 dark:text-gray-100">{CATEGORY_LABELS[data.topCategory]}</span>
                </p>
              )}
            </Card>

            <Card>
              <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Расходы по дням</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.dailyExpenses}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).getDate().toString()}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.ceil(data.dailyExpenses.length / 6)}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value), currency)}
                    labelFormatter={(d) => new Date(d).toLocaleDateString("ru-RU")}
                  />
                  <Bar dataKey="amount" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
