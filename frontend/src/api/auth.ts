import { api } from "./client";
import type { User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

export function login(email: string, password: string) {
  return api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data);
}

export function register(name: string, email: string, password: string) {
  return api.post<AuthResponse>("/auth/register", { name, email, password }).then((r) => r.data);
}
