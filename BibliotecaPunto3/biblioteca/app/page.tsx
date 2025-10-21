import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          BIENVENIDO AL GESTOR DE BIBLIOTECAS
        </h1>
        <p className="text-muted-foreground">
          Administra librerías, libros y préstamos de forma sencilla.
        </p>
        <div className="flex items-center gap-3 justify-center pt-2">
          <Link href="/login">
            <Button className="min-w-32">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="min-w-32">
              Crear cuenta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
