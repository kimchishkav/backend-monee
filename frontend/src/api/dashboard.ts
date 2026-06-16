import { api } from "./client";
import type { DashboardData } from "../types";

export function getDashboard(month: string) {
  return api.get<DashboardData>("/dashboard", { params: { month } }).then((r) => r.data);
}
