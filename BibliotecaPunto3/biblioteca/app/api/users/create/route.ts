import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, password, full_name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No se pudo obtener el ID de usuario" }, { status: 500 });
    }

    // Crear el perfil vinculado al usuario
    const { error: profileError } = await admin
      .from("profiles")
      .insert({ id: userId, full_name: full_name ?? null, email });

    if (profileError) {
      // El usuario ya fue creado; devolvemos 201 pero advertimos del perfil
      return NextResponse.json({ warning: "Usuario creado, pero falló crear perfil", details: profileError.message }, { status: 201 });
    }

    return NextResponse.json({ ok: true, userId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error inesperado" }, { status: 500 });
  }
}