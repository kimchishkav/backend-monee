import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AddAccountModal } from "../../components/AddAccountModal";
import { getAccounts, deleteAccount } from "../../api/accounts";
import { getErrorMessage } from "../../api/client";
import { ACCOUNT_TYPE_LABELS, formatMoney } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";
import type { Account, AccountType } from "../../types";

const FILTERS: { value: AccountType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Все счета" },
  { value: "CARD", label: "Карты" },
  { value: "CASH", label: "Наличные" },
  { value: "DEPOSIT", label: "Депозиты" },
];

const ACCOUNT_ICON: Record<AccountType, string> = {
  CARD: "💳",
  CASH: "💵",
  DEPOSIT: "🔒",
};

export function AccountsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? "RUB";

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<AccountType | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [error, setError] = useState("");

  function reload() {
    setLoading(true);
    getAccounts(filter === "ALL" ? undefined : filter)
      .then(setAccounts)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleDelete(id: number) {
    setError("");
    if (!confirm("Удалить этот счет?")) return;
    try {
      await deleteAccount(id);
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Счета</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + Добавить счет
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.value ? "bg-brand-500 text-white" : "bg-white text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-white/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Загрузка...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500">Счетов пока нет</p>}
          {accounts.map((a) => (
            <Card key={a.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-lg">
                  {ACCOUNT_ICON[a.type]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{a.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{ACCOUNT_TYPE_LABELS[a.type]}</p>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatMoney(a.balance, currency)}</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setEditing(a);
                    setModalOpen(true);
                  }}
                >
                  Изменить
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => handleDelete(a.id)}>
                  Удалить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddAccountModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={reload} account={editing} />
    </div>
  );
}
