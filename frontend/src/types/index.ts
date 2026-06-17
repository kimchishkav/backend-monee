export type AccountType = "CARD" | "CASH" | "DEPOSIT";
export type AccountStatus = "ACTIVE" | "FROZEN";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type Category =
  | "FOOD"
  | "TRANSPORT"
  | "CLOTHES"
  | "HEALTH"
  | "ENTERTAINMENT"
  | "EDUCATION"
  | "UTILITIES"
  | "OTHER"
  | "SALARY"
  | "GIFT"
  | "OTHER_INCOME";

export type Theme = "LIGHT" | "DARK";

export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  monthlyLimit: number | null;
  theme: Theme;
  avatar: string | null;
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  status: AccountStatus;
  notes: string | null;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: Category | null;
  accountId: number;
  accountName: string;
  toAccountId: number | null;
  toAccountName: string | null;
  date: string;
  description: string | null;
}

export interface DailyAmount {
  date: string;
  amount: number;
}

export interface DashboardData {
  totalBalance: number;
  balanceChangePercent: number | null;
  accountsBalance: number;
  accountsCount: number;
  depositsBalance: number;
  depositsCount: number;
  frozenBalance: number;
  frozenCount: number;
  monthlyExpenses: number;
  expensesChangePercent: number | null;
  recentTransactions: Transaction[];
  expensesChart: DailyAmount[];
  accounts: Account[];
  limitExceeded: boolean;
}

export interface CategoryAmount {
  category: Category;
  amount: number;
  percent: number;
}

export interface StatisticsData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categories: CategoryAmount[];
  topCategory: Category | null;
  dailyExpenses: DailyAmount[];
}
