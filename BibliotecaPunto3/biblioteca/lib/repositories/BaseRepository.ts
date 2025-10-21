import { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseServer } from "../supabaseServer";
import type { TableName, CreatePayload, UpdatePayload } from "../types";

export class BaseRepository<T extends { id: string }> {
  protected table: TableName;

  constructor(table: TableName) {
    this.table = table;
  }

  async list(): Promise<T[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from(this.table).select("*");
    if (error) throw error as PostgrestError;
    return (data ?? []) as T[];
  }

  async get(id: string): Promise<T | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from(this.table).select("*").eq("id", id).maybeSingle();
    if (error) throw error as PostgrestError;
    return (data as T) ?? null;
  }

  async create(payload: CreatePayload<T>): Promise<T> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from(this.table).insert(payload as any).select("*").single();
    if (error) throw error as PostgrestError;
    return data as T;
  }

  async upsert(payload: Partial<T>): Promise<T> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from(this.table).upsert(payload as any).select("*").single();
    if (error) throw error as PostgrestError;
    return data as T;
  }

  async update(id: string, payload: UpdatePayload<T>): Promise<T> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from(this.table).update(payload as any).eq("id", id).select("*").single();
    if (error) throw error as PostgrestError;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseServer();
    const { error } = await supabase.from(this.table).delete().eq("id", id);
    if (error) throw error as PostgrestError;
  }
}