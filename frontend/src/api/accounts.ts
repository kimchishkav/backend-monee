import { api } from "./client";
import type { Account, AccountStatus, AccountType } from "../types";

export interface AccountRequest {
  name: string;
  type: AccountType;
  balance: number;
  status?: AccountStatus;
  notes?: string | null;
}

export function getAccounts(type?: AccountType) {
  return api.get<Account[]>("/accounts", { params: type ? { type } : {} }).then((r) => r.data);
}

export function createAccount(request: AccountRequest) {
  return api.post<Account>("/accounts", request).then((r) => r.data);
}

export function updateAccount(id: number, request: AccountRequest) {
  return api.put<Account>(`/accounts/${id}`, request).then((r) => r.data);
}

export function deleteAccount(id: number) {
  return api.delete(`/accounts/${id}`);
}

export function unfreezeAccount(id: number, toAccountId: number) {
  return api.post<Account>(`/accounts/${id}/unfreeze`, { toAccountId }).then((r) => r.data);
}
