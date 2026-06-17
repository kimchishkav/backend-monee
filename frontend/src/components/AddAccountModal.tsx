import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./ui/Modal";
import { Field, Input } from "./ui/Input";
import { Dropdown } from "./ui/Dropdown";
import { Button } from "./ui/Button";
import { ACCOUNT_TYPE_LABELS } from "../lib/constants";
import { createAccount, updateAccount } from "../api/accounts";
import { getErrorMessage } from "../api/client";
import type { Account, AccountStatus, AccountType } from "../types";

export function AddAccountModal({
  open,
  onClose,
  onSaved,
  account,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  account?: Account | null;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CARD");
  const [balance, setBalance] = useState("");
  const [status, setStatus] = useState<AccountStatus>("ACTIVE");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(account);

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "");
      setType(account?.type ?? "CARD");
      setBalance(account ? String(account.balance) : "");
      setStatus(account?.status ?? "ACTIVE");
      setNotes(account?.notes ?? "");
      setError("");
    }
  }, [open, account]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { name, type, balance: Number(balance), status, notes: notes || null };
      if (account) {
        await updateAccount(account.id, payload);
      } else {
        await createAccount(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Редактировать счет" : "Добавить счет"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Название">
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Kaspi Gold" />
        </Field>

        <Field label="Тип счета">
          <Dropdown
            value={type}
            onChange={(v) => setType(v as AccountType)}
            options={Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </Field>

        <Field label={isEdit ? "Баланс" : "Начальный баланс"}>
          <Input type="number" step="0.01" required value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" />
        </Field>

        <Field label="Статус">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus("ACTIVE")}
              className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
                status === "ACTIVE" ? "bg-brand-500 text-white" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
              }`}
            >
              ✅ Активный
            </button>
            <button
              type="button"
              onClick={() => setStatus("FROZEN")}
              className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
                status === "FROZEN" ? "bg-violet-500 text-white" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
              }`}
            >
              🔐 Заморожен
            </button>
          </div>
          {status === "FROZEN" && (
            <p className="mt-1.5 text-xs text-violet-500 dark:text-violet-400">
              Замороженные средства не входят в общий баланс. Разморозить можно позже на странице Счета.
            </p>
          )}
        </Field>

        <Field label="Заметка (опционально)">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Например, дата начисления, условия..." />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Сохраняем..." : "Сохранить"}
        </Button>
      </form>
    </Modal>
  );
}
