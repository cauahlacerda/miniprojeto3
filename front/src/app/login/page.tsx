"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "lib/api";
import { useAuth } from "contexts/AuthContext";

import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { Alert, AlertTitle, AlertDescription } from "ui/alert";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await api.post("/users/register", { username, password });
      }

      const response = await api.post(
        "/users/token",
        new URLSearchParams({ username, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      login(response.data.access_token, username);
      router.push("/");
    } catch (err: any) {
      setError("Erro ao autenticar: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-lg bg-card p-8 shadow-lg"
      >
        <h1 className="text-3xl font-bold text-foreground">
          {isRegister ? "Registrar" : "Login"}
        </h1>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="username">Usuário</Label>
          <Input
            id="username"
            type="text"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>

        <Button type="submit" className="w-full" variant="primary">
          {isRegister ? "Registrar" : "Entrar"}
        </Button>

        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-center text-sm text-primary hover:underline"
        >
          {isRegister ? "Já tem conta? Faça login" : "Não tem conta? Registre-se"}
        </button>
      </form>
    </div>
  );
}
