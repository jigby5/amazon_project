import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../apiBase';
import SiteNav from '../components/SiteNav';
import type { Book } from '../types/Book';

type Draft = {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: string;
  price: string;
};

const emptyDraft = (): Draft => ({
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: '',
  price: '',
});

function draftToPayload(draft: Draft, bookID: number): Record<string, unknown> {
  const pageCount = draft.pageCount.trim() === '' ? null : Number(draft.pageCount);
  const price = draft.price.trim() === '' ? null : Number(draft.price);
  return {
    bookID,
    title: draft.title.trim(),
    author: draft.author.trim() || null,
    publisher: draft.publisher.trim() || null,
    isbn: draft.isbn.trim() || null,
    classification: draft.classification.trim() || null,
    category: draft.category.trim() || null,
    pageCount: Number.isFinite(pageCount as number) ? pageCount : null,
    price: Number.isFinite(price as number) ? price : null,
  };
}

function bookToDraft(b: Book): Draft {
  return {
    title: b.title ?? '',
    author: b.author ?? '',
    publisher: b.publisher ?? '',
    isbn: b.isbn ?? '',
    classification: b.classification ?? '',
    category: b.category ?? '',
    pageCount: b.pageCount != null ? String(b.pageCount) : '',
    price: b.price != null ? String(b.price) : '',
  };
}

function AdminBooksPage() {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const loadBooks = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/Bookstore/GetBooks`);
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  /** After choosing a row to edit, scroll to the form and focus the title field so it’s obvious where to change data. */
  useEffect(() => {
    if (editingId == null) return;
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const focusTitle = () => document.getElementById('adm-title')?.focus();
    const t = window.setTimeout(focusTitle, 450);
    return () => window.clearTimeout(t);
  }, [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const startEdit = (b: Book) => {
    setEditingId(b.bookID);
    setDraft(bookToDraft(b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError('Title is required.');
      return;
    }

    setError(null);
    try {
      if (editingId != null) {
        const body = draftToPayload(draft, editingId);
        const res = await fetch(`${API_BASE}/Bookstore/UpdateBook/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `Update failed (${res.status})`);
        }
      } else {
        const body = draftToPayload(draft, 0);
        const res = await fetch(`${API_BASE}/Bookstore/AddBook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `Add failed (${res.status})`);
        }
      }
      resetForm();
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  };

  const handleDelete = async (b: Book) => {
    if (!window.confirm(`Delete “${b.title}” from the database?`)) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/Bookstore/DeleteBook/${b.bookID}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      if (editingId === b.bookID) resetForm();
      await loadBooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="container py-4 text-start">
      <div className="row g-4">
        <div className="col-12">
          <SiteNav />
          <h1 className="h2 mb-2">Admin — manage books</h1>
          <p className="text-muted small mb-0">
            Changes call the API and update <code>Bookstore.sqlite</code> on the server.
          </p>
        </div>

        {error && (
          <div className="col-12">
            <div className="alert alert-danger py-2 mb-0" role="alert">
              {error}
            </div>
          </div>
        )}

        <div className="col-12" ref={formSectionRef}>
          <div
            className={`card shadow-sm ${editingId != null ? 'border-primary border-2' : ''}`}
          >
            {editingId != null && (
              <div
                className="alert alert-info mb-0 rounded-top border-0 py-3"
                role="status"
                aria-live="polite"
              >
                <strong>Editing this book</strong>{' '}
                <span className="text-muted">
                  (ID {editingId}
                  {draft.title ? `: ${draft.title}` : ''})
                </span>
                <span className="d-block small mt-2 mb-0">
                  Change the fields in the form below, then click <strong>Save changes</strong>. Or
                  use <strong>Cancel edit</strong> to stop without saving.
                </span>
              </div>
            )}
            <div className="card-header">
              {editingId != null ? `Edit book #${editingId}` : 'Add a new book'}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-title">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      id="adm-title"
                      className="form-control"
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-author">
                      Author
                    </label>
                    <input
                      id="adm-author"
                      className="form-control"
                      value={draft.author}
                      onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-publisher">
                      Publisher
                    </label>
                    <input
                      id="adm-publisher"
                      className="form-control"
                      value={draft.publisher}
                      onChange={(e) => setDraft((d) => ({ ...d, publisher: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-isbn">
                      ISBN
                    </label>
                    <input
                      id="adm-isbn"
                      className="form-control"
                      value={draft.isbn}
                      onChange={(e) => setDraft((d) => ({ ...d, isbn: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-class">
                      Classification
                    </label>
                    <input
                      id="adm-class"
                      className="form-control"
                      value={draft.classification}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, classification: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-cat">
                      Category
                    </label>
                    <input
                      id="adm-cat"
                      className="form-control"
                      value={draft.category}
                      onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-pages">
                      Page count
                    </label>
                    <input
                      id="adm-pages"
                      type="number"
                      min={0}
                      className="form-control"
                      value={draft.pageCount}
                      onChange={(e) => setDraft((d) => ({ ...d, pageCount: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="adm-price">
                      Price
                    </label>
                    <input
                      id="adm-price"
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-control"
                      value={draft.price}
                      onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-3 d-flex flex-wrap gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingId != null ? 'Save changes' : 'Add book'}
                  </button>
                  {editingId != null && (
                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12">
          <h2 className="h5">All books</h2>
          {loading ? (
            <p className="text-muted small mb-0">Loading…</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Title</th>
                    <th scope="col">Category</th>
                    <th scope="col" className="text-end">
                      Price
                    </th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.bookID}>
                      <td>{b.bookID}</td>
                      <td>{b.title}</td>
                      <td>{b.category ?? '—'}</td>
                      <td className="text-end">
                        {b.price != null ? `$${Number(b.price).toFixed(2)}` : '—'}
                      </td>
                      <td className="text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => startEdit(b)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(b)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBooksPage;
