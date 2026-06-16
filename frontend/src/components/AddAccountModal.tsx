import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./ui/Modal";
import { Field, Input } from "./ui/Input";
import { Dropdown } from "./ui/Dropdown";
import { Button } from "./ui/Button";
import { ACCOUNT_TYPE_LABELS } from "../lib/constants";
import { createAccount, updateAccount } from "../api/accounts";
import { getErrorMessage } from "../api/client";
import type { Account, AccountType } from "../types";

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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(account);

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "");
      setType(account?.type ?? "CARD");
      setBalance(account ? String(account.balance) : "");
      setError("");
    }
  }, [open, account]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { name, type, balance: Number(balance) };
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
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Tinkoff Black" />
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

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Сохраняем..." : "Сохранить"}
        </Button>
      </form>
    </Modal>
  );
}
