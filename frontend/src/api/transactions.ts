import { api } from "./client";
import type { Category, Transaction, TransactionType } from "../types";

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  category: Category;
  accountId: number;
  date: string;
  description?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: Category;
  accountId?: number;
  from?: string;
  to?: string;
}

export function getTransactions(filters: TransactionFilters = {}) {
  return api.get<Transaction[]>("/transactions", { params: filters }).then((r) => r.data);
}

export function createTransaction(request: TransactionRequest) {
  return api.post<Transaction>("/transactions", request).then((r) => r.data);
}

export function deleteTransaction(id: number) {
  return api.delete(`/transactions/${id}`);
}
