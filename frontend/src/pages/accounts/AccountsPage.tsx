import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AddAccountModal } from "../../components/AddAccountModal";
import { UnfreezeModal } from "../../components/UnfreezeModal";
import { getAccounts, deleteAccount } from "../../api/accounts";
import { getErrorMessage } from "../../api/client";
import { ACCOUNT_TYPE_LABELS, formatMoney } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";
import type { Account, AccountType } from "../../types";

const FILTERS: { value: AccountType | "ALL" | "FROZEN"; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "CARD", label: "Карты" },
  { value: "CASH", label: "Наличные" },
  { value: "DEPOSIT", label: "Депозиты" },
  { value: "FROZEN", label: "🔐 Заморожены" },
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
  const [filter, setFilter] = useState<AccountType | "ALL" | "FROZEN">("ALL");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [unfreezing, setUnfreezing] = useState<Account | null>(null);
  const [error, setError] = useState("");

  function reload() {
    setLoading(true);
    getAccounts()
      .then(setAccounts)
      .finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, []);

  const activeAccounts = accounts.filter((a) => a.status === "ACTIVE");

  const displayed = filter === "ALL"
    ? accounts
    : filter === "FROZEN"
    ? accounts.filter((a) => a.status === "FROZEN")
    : accounts.filter((a) => a.type === filter && a.status === "ACTIVE");

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
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          + Добавить счет
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.value
                ? f.value === "FROZEN" ? "bg-violet-500 text-white" : "bg-brand-500 text-white"
                : "bg-white text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-white/5"
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
          {displayed.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500">Счетов не найдено</p>}
          {displayed.map((a) => (
            <Card key={a.id} className={`flex flex-col gap-3 ${a.status === "FROZEN" ? "border-violet-200 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-500/5" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${a.status === "FROZEN" ? "bg-violet-100 dark:bg-violet-500/20" : "bg-violet-100 dark:bg-violet-500/20"}`}>
                  {a.status === "FROZEN" ? "🔐" : ACCOUNT_ICON[a.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{a.name}</p>
                    {a.status === "FROZEN" && (
                      <span className="shrink-0 rounded-full bg-violet-100 dark:bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                        Заморожен
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{ACCOUNT_TYPE_LABELS[a.type]}</p>
                </div>
              </div>

              <p className={`text-2xl font-semibold ${a.status === "FROZEN" ? "text-violet-600 dark:text-violet-400" : "text-gray-900 dark:text-gray-100"}`}>
                {formatMoney(a.balance, currency)}
              </p>

              {a.notes && (
                <p className="rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  📝 {a.notes}
                </p>
              )}

              <div className="flex gap-2">
                {a.status === "FROZEN" ? (
                  <>
                    <Button variant="secondary" className="flex-1" onClick={() => setUnfreezing(a)}>
                      Разморозить
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={() => { setEditing(a); setModalOpen(true); }}>
                      Изменить
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" className="flex-1" onClick={() => { setEditing(a); setModalOpen(true); }}>
                      Изменить
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={() => handleDelete(a.id)}>
                      Удалить
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={reload}
        account={editing}
      />

      {unfreezing && (
        <UnfreezeModal
          frozen={unfreezing}
          activeAccounts={activeAccounts}
          currency={currency}
          onClose={() => setUnfreezing(null)}
          onDone={reload}
        />
      )}
    </div>
  );
}
