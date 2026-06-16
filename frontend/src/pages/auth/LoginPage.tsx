import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { getErrorMessage } from "../../api/client";
import moneeLogo from "../../assets/monee-logo.svg";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7fb] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 dark:border-white/10 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center">
          <img src={moneeLogo} alt="monee" className="h-14" />
        </div>
        <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">Привет!</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Войдите, чтобы продолжить</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </Field>
          <Field label="Пароль">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Нет аккаунта?{" "}
          <Link to="/register" className="font-medium text-brand-500 hover:text-brand-600">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
