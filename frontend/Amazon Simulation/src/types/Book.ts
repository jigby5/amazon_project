/** Matches API JSON (camelCase). Optional fields may be null from SQLite. */
export interface Book {
  bookID: number;
  title: string;
  author?: string | null;
  publisher?: string | null;
  isbn?: string | null;
  classification?: string | null;
  category?: string | null;
  pageCount?: number | null;
  price?: number | null;
}
