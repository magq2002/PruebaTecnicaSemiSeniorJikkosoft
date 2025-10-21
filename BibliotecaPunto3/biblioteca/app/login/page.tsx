"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        // Asegurar que el perfil exista para cumplir FK libraries.owner_id → profiles.id
        const u = data.user;
        if (u?.id) {
          const fullName = (u.user_metadata as any)?.full_name ?? u.email ?? "Sin nombre";
          const emailVal = u.email ?? email;
          try {
            await supabase
              .from("profiles")
              .upsert({ id: u.id, full_name: fullName, email: emailVal })
              .select("*")
              .single();
          } catch (upErr) {
            // Ignoramos errores aquí; si hay conflicto único o RLS, se resolverá tras editar perfil
            console.warn("No se pudo upsert perfil tras login", upErr);
          }
        }
        setMessage("Sesión iniciada correctamente.");
        setEmail("");
        setPassword("");
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setError(err.message ?? "Error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>
        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? "Iniciando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          ¿No tienes cuenta? <a href="/register" className="underline">Regístrate</a>
        </p>
      </Card>
    </div>
  );
}