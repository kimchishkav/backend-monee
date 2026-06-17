import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Dropdown } from "./ui/Dropdown";
import { Field } from "./ui/Input";
import { Button } from "./ui/Button";
import { unfreezeAccount } from "../api/accounts";
import { getErrorMessage } from "../api/client";
import { formatMoney } from "../lib/constants";
import type { Account } from "../types";

export function UnfreezeModal({
  frozen,
  activeAccounts,
  currency,
  onClose,
  onDone,
}: {
  frozen: Account;
  activeAccounts: Account[];
  currency: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [toAccountId, setToAccountId] = useState<string>(
    activeAccounts[0] ? String(activeAccounts[0].id) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleUnfreeze() {
    if (!toAccountId) { setError("Выберите счет"); return; }
    setSubmitting(true);
    setError("");
    try {
      await unfreezeAccount(frozen.id, Number(toAccountId));
      onDone();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Разморозить средства">
      <div className="space-y-4">
        <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 p-4">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-300">{frozen.name}</p>
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-400 mt-1">
            {formatMoney(frozen.balance, currency)}
          </p>
          {frozen.notes && <p className="mt-2 text-xs text-violet-600 dark:text-violet-400">{frozen.notes}</p>}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Вся сумма будет переведена на выбранный счёт. Счёт станет активным с нулевым балансом.
        </p>

        <Field label="Перевести на счёт">
          <Dropdown
            value={toAccountId}
            onChange={setToAccountId}
            options={activeAccounts.map((a) => ({ value: String(a.id), label: `${a.name} (${formatMoney(a.balance, currency)})` }))}
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={handleUnfreeze} disabled={submitting || !toAccountId}>
            {submitting ? "Перевод..." : "Разморозить"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
