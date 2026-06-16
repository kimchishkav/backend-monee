import { api } from "./client";
import type { StatisticsData } from "../types";

export function getStatistics(month: string, accountId?: number) {
  return api
    .get<StatisticsData>("/statistics", { params: accountId ? { month, accountId } : { month } })
    .then((r) => r.data);
}
