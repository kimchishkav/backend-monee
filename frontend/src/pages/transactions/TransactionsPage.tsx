import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Dropdown } from "../../components/ui/Dropdown";
import { TransactionRow } from "../../components/TransactionRow";
import { AddTransactionModal } from "../../components/AddTransactionModal";
import { getTransactions, deleteTransaction } from "../../api/transactions";
import { getAccounts } from "../../api/accounts";
import { getErrorMessage } from "../../api/client";
import { CATEGORY_LABELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";
import type { Account, Category, Transaction, TransactionType } from "../../types";

export function TransactionsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? "RUB";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState<TransactionType | "ALL">("ALL");
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [accountId, setAccountId] = useState<string>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  function reload() {
    setLoading(true);
    getTransactions({
      type: type === "ALL" ? undefined : type,
      category: category === "ALL" ? undefined : category,
      accountId: accountId === "ALL" ? undefined : Number(accountId),
      from: from || undefined,
      to: to || undefined,
    })
      .then(setTransactions)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, category, accountId, from, to]);

  async function handleDelete(id: number) {
    setError("");
    if (!confirm("Удалить операцию? Сумма будет возвращена/списана со счета.")) return;
    try {
      await deleteTransaction(id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Операции</h1>
        <Button onClick={() => setModalOpen(true)}>+ Добавить операцию</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Dropdown
            value={type}
            onChange={(v) => setType(v as TransactionType | "ALL")}
            options={[
              { value: "ALL", label: "Все типы" },
              { value: "INCOME", label: "Доходы" },
              { value: "EXPENSE", label: "Расходы" },
            ]}
          />
          <Dropdown
            value={category}
            onChange={(v) => setCategory(v as Category | "ALL")}
            options={[
              { value: "ALL", label: "Все категории" },
              ...allCategories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
            ]}
          />
          <Dropdown
            value={accountId}
            onChange={setAccountId}
            options={[
              { value: "ALL", label: "Все счета" },
              ...accounts.map((a) => ({ value: String(a.id), label: a.name })),
            ]}
          />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400 dark:bg-[#15131e]"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400 dark:bg-[#15131e]"
          />
        </div>
      </Card>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

      <Card>
        {loading ? (
          <p className="py-6 text-center text-gray-400 dark:text-gray-500">Загрузка...</p>
        ) : transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Операций не найдено</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {transactions.map((t) => (
              <TransactionRow key={t.id} transaction={t} currency={currency} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </Card>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} accounts={accounts} onCreated={reload} />
    </div>
  );
}
