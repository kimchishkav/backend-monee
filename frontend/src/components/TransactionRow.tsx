import { CATEGORY_LABELS, formatMoney } from "../lib/constants";
import type { Transaction } from "../types";

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🍽️",
  TRANSPORT: "🚌",
  CLOTHES: "👕",
  HEALTH: "💊",
  ENTERTAINMENT: "🎬",
  EDUCATION: "📚",
  UTILITIES: "🏠",
  OTHER: "📦",
  SALARY: "💰",
  GIFT: "🎁",
  OTHER_INCOME: "💵",
};

export function TransactionRow({
  transaction,
  currency,
  onDelete,
}: {
  transaction: Transaction;
  currency: string;
  onDelete?: (id: number) => void;
}) {
  const isExpense = transaction.type === "EXPENSE";
  const isTransfer = transaction.type === "TRANSFER";
  const categoryLabel = transaction.category ? CATEGORY_LABELS[transaction.category] : null;
  const emoji = isTransfer ? "↔️" : (transaction.category ? (CATEGORY_EMOJI[transaction.category] ?? "💳") : "💳");

  const subtitle = isTransfer
    ? `${transaction.accountName} → ${transaction.toAccountName ?? "?"}`
    : `${categoryLabel ?? ""} • ${transaction.accountName}`;

  const title = transaction.description
    || (isTransfer ? `Перевод` : categoryLabel)
    || "Операция";

  return (
    <div className="group flex items-center gap-3 py-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
        isTransfer ? "bg-violet-50 dark:bg-violet-500/10" : "bg-brand-50 dark:bg-brand-500/10"
      }`}>
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="truncate text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${
          isTransfer ? "text-violet-600 dark:text-violet-400"
          : isExpense ? "text-gray-900 dark:text-gray-100"
          : "text-emerald-500"
        }`}>
          {isTransfer ? "" : isExpense ? "−" : "+"}
          {formatMoney(transaction.amount, currency)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(transaction.date).toLocaleDateString("ru-RU")}</p>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 transition-opacity group-hover:opacity-100 text-gray-300 hover:text-red-500"
          aria-label="Удалить"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
