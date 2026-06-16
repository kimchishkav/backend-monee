import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { Dropdown } from "../../components/ui/Dropdown";
import { updateProfile } from "../../api/profile";
import { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { Theme } from "../../types";

const CURRENCIES = [
  { value: "RUB", label: "₽ Рубль" },
  { value: "KZT", label: "₸ Тенге" },
  { value: "USD", label: "$ Доллар" },
  { value: "EUR", label: "€ Евро" },
];

export function ProfilePage() {
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [currency, setCurrency] = useState(user?.currency ?? "RUB");
  const [monthlyLimit, setMonthlyLimit] = useState(user?.monthlyLimit?.toString() ?? "");
  const [theme, setTheme] = useState<Theme>(user?.theme ?? "LIGHT");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user?.name?.trim().charAt(0).toUpperCase() || "?";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const updated = await updateProfile({
        name,
        currency,
        monthlyLimit: monthlyLimit ? Number(monthlyLimit) : null,
        theme,
      });
      setUser(updated);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleThemeChange(next: Theme) {
    setTheme(next);
    try {
      const updated = await updateProfile({ theme: next });
      setUser(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения");
      return;
    }
    setError("");
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await updateProfile({ avatar: reader.result as string });
        setUser(updated);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleAvatarRemove() {
    setAvatarUploading(true);
    try {
      const updated = await updateProfile({ removeAvatar: true });
      setUser(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Профиль</h1>

      <Card>
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-violet-400 text-2xl font-semibold text-white">
              {initials}
            </span>
          )}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUploading ? "Загрузка..." : "Изменить фото"}
              </Button>
              {user?.avatar && (
                <Button type="button" variant="ghost" disabled={avatarUploading} onClick={handleAvatarRemove}>
                  Удалить
                </Button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG до 2 МБ</p>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Имя">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label="Email">
            <Input value={user?.email ?? ""} disabled className="bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500" />
          </Field>

          <Field label="Валюта по умолчанию">
            <Dropdown value={currency} onChange={setCurrency} options={CURRENCIES} />
          </Field>

          <Field label="Месячный лимит расходов">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="Не задан"
            />
          </Field>

          <Field label="Тема">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleThemeChange("LIGHT")}
                className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  theme === "LIGHT" ? "bg-brand-500 text-white" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                }`}
              >
                ☀️ Светлая
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("DARK")}
                className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  theme === "DARK" ? "bg-brand-500 text-white" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                }`}
              >
                🌙 Темная
              </button>
            </div>
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-500">Профиль обновлен</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Сохраняем..." : "Сохранить изменения"}
          </Button>
        </form>
      </Card>

      <Button variant="ghost" onClick={logout} className="w-full justify-center border border-gray-200 dark:border-white/10">
        Выйти из аккаунта
      </Button>
    </div>
  );
}
