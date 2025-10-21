"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError(
        "Faltan variables de entorno de Supabase. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage(
          data.user
            ? "Cuenta creada correctamente. Verifica tu correo si se requiere confirmación."
            : "Registro enviado. Revisa tu correo para confirmar tu cuenta.",
        );
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message ?? "Error inesperado al registrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold mb-4">Crear cuenta</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600" role="status">
              {message}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <a href="/login" className="underline">Inicia sesión</a>
        </p>
      </Card>
    </div>
  );
}