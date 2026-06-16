import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./ui/Modal";
import { Field, Input } from "./ui/Input";
import { Dropdown } from "./ui/Dropdown";
import { Button } from "./ui/Button";
import { CATEGORY_LABELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../lib/constants";
import { createTransaction } from "../api/transactions";
import { getErrorMessage } from "../api/client";
import type { Account, Category, TransactionType } from "../types";

export function AddTransactionModal({
  open,
  onClose,
  accounts,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onCreated: () => void;
}) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("FOOD");
  const [accountId, setAccountId] = useState<number | "">("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (open) {
      setType("EXPENSE");
      setAmount("");
      setCategory("FOOD");
      setAccountId(accounts[0]?.id ?? "");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setError("");
    }
  }, [open, accounts]);

  useEffect(() => {
    setCategory(type === "EXPENSE" ? "FOOD" : "SALARY");
  }, [type]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accountId) {
      setError("Выберите счет");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createTransaction({
        type,
        amount: Number(amount),
        category,
        accountId: Number(accountId),
        date,
        description: description || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Добавить операцию">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
              type === "EXPENSE" ? "bg-red-50 text-red-600" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
            }`}
          >
            Расход
          </button>
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
              type === "INCOME" ? "bg-green-50 text-green-600" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
            }`}
          >
            Доход
          </button>
        </div>

        <Field label="Сумма">
          <Input type="number" min="0.01" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>

        <Field label="Категория">
          <Dropdown
            value={category}
            onChange={(v) => setCategory(v as Category)}
            options={categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
          />
        </Field>

        <Field label="Счет">
          <Dropdown
            value={accountId === "" ? "" : String(accountId)}
            onChange={(v) => setAccountId(Number(v))}
            options={accounts.map((a) => ({ value: String(a.id), label: a.name }))}
          />
        </Field>

        <Field label="Дата">
          <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <Field label="Описание (опционально)">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Например, Ресторан" />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Сохраняем..." : "Сохранить"}
        </Button>
      </form>
    </Modal>
  );
}
