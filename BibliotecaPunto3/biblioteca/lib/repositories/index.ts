import { BaseRepository } from "./BaseRepository";
import type { Book, Library, Loan, Profile, Member } from "../types";

export const LibrariesRepo = new BaseRepository<Library>("libraries");
export const BooksRepo = new BaseRepository<Book>("books");
export const LoansRepo = new BaseRepository<Loan>("loans");
export const ProfilesRepo = new BaseRepository<Profile>("profiles");
export const MembersRepo = new BaseRepository<Member>("members");