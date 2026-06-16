import type { ReactNode } from "react";
import { Card } from "./ui/Card";

export function StatCard({
  icon,
  iconBg,
  label,
  value,
  hint,
  hintPositive,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  hint?: string;
  hintPositive?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>{icon}</div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      {hint && (
        <p className={`mt-1 text-xs font-medium ${hintPositive ? "text-emerald-500" : "text-red-400"}`}>{hint}</p>
      )}
    </Card>
  );
}
