import { Dropdown } from "./Dropdown";

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export function MonthSelect({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  const [year, month] = value.split("-").map(Number);

  const options: { value: string; label: string }[] = [];
  for (let i = 0; i >= -11; i--) {
    const d = new Date(year, month - 1 + i, 1);
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value: v, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` });
  }

  return <Dropdown value={value} onChange={onChange} options={options} className="w-auto min-w-[160px]" />;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
