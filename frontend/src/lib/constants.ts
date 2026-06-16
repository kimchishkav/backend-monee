import type { AccountType, Category, TransactionType } from "../types";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CARD: "Карта",
  CASH: "Наличные",
  DEPOSIT: "Депозит",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Доход",
  EXPENSE: "Расход",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  FOOD: "Еда",
  TRANSPORT: "Транспорт",
  CLOTHES: "Одежда",
  HEALTH: "Здоровье",
  ENTERTAINMENT: "Развлечения",
  EDUCATION: "Учеба",
  UTILITIES: "Коммунальные",
  OTHER: "Другое",
  SALARY: "Зарплата",
  GIFT: "Подарок",
  OTHER_INCOME: "Другой доход",
};

export const EXPENSE_CATEGORIES: Category[] = [
  "FOOD",
  "TRANSPORT",
  "CLOTHES",
  "HEALTH",
  "ENTERTAINMENT",
  "EDUCATION",
  "UTILITIES",
  "OTHER",
];

export const INCOME_CATEGORIES: Category[] = ["SALARY", "GIFT", "OTHER_INCOME"];

export const CATEGORY_COLORS: Record<Category, string> = {
  FOOD: "#ec4899",
  TRANSPORT: "#a78bfa",
  CLOTHES: "#f472b6",
  HEALTH: "#34d399",
  ENTERTAINMENT: "#60a5fa",
  EDUCATION: "#fbbf24",
  UTILITIES: "#fcd34d",
  OTHER: "#9ca3af",
  SALARY: "#34d399",
  GIFT: "#f472b6",
  OTHER_INCOME: "#9ca3af",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: "₽",
  KZT: "₸",
  USD: "$",
  EUR: "€",
};

export function formatMoney(amount: number, currency = "RUB"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${formatted} ${symbol}`;
}
