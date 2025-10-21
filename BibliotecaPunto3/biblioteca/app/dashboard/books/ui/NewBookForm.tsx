"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function NewBookForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [published_year, setPublishedYear] = useState("");
  const [available, setAvailable] = useState(true);
  const [library_id, setLibraryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase client no disponible en cliente");
      setLoading(false);
      return;
    }
    if (!supabase) {
      return;
    }
    const { error } = await supabase.from("books").insert({ title, author, isbn, published_year, available, library_id: library_id || null });
    if (error) setError(error.message);
    setLoading(false);
    setTitle("");
    setAuthor("");
    setIsbn("");
    setPublishedYear("");
    setAvailable(true);
    setLibraryId("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-white p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input className="border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input className="border rounded p-2" placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        <input className="border rounded p-2" placeholder="Year" value={published_year} onChange={(e) => setPublishedYear(e.target.value)} />
        <div className="flex items-center gap-2">
          <input id="available" type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          <label htmlFor="available">Available</label>
        </div>
        <input className="border rounded p-2" placeholder="Library ID" value={library_id} onChange={(e) => setLibraryId(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50">
          {loading ? "Guardando..." : "Crear Book"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </form>
  );
}