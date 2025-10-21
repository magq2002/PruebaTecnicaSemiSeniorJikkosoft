export type UUID = string;
export type Timestamp = string; // ISO string

export interface BaseEntity {
  id: UUID;
  created_at?: Timestamp;
}

export interface Library extends BaseEntity {
  name: string;
  address?: string | null;
  phone?: string | null;
  owner_id?: UUID | null; // likely links to profiles.id or auth.users.id
}

export interface Book extends BaseEntity {
  title: string;
  author?: string | null;
  isbn?: string | null;
  published_year?: string | null; // stored as text in schema image
  available?: boolean | null;
  library_id?: UUID | null;
}

export interface Loan extends BaseEntity {
  book_id: UUID;
  borrower_id: UUID;
  library_id: UUID;
  loan_date: string; // date
  return_date?: string | null; // date
  returned?: boolean | null;
}

export interface Profile extends BaseEntity {
  full_name?: string | null;
  email?: string | null;
}

export interface Member extends BaseEntity {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  active?: boolean | null;
}

export type TableName = "libraries" | "books" | "loans" | "profiles" | "members";

export type CreatePayload<T> = Omit<T, "id" | "created_at">;
export type UpdatePayload<T> = Partial<Omit<T, "id" | "created_at">>;