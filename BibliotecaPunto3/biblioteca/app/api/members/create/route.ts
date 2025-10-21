import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { full_name, email, phone, active } = await req.json();
    if (!full_name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("members")
      .insert({ full_name, email, phone: phone ?? null, active: active ?? true })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error inesperado" }, { status: 500 });
  }
}