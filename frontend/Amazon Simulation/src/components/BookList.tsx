import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE } from '../apiBase';
import { useCart } from '../context/CartContext';
import type { Book } from '../types/Book';
import type { BrowseRestoreState } from '../types/BrowseRestore';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

type BookListProps = {
  selectedCategories: string[];
  currentPage: number;
  onCurrentPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  browseRestore: BrowseRestoreState;
};

function BookList({
  selectedCategories,
  currentPage,
  onCurrentPageChange,
  pageSize,
  onPageSizeChange,
  browseRestore,
}: BookListProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [books, setBooks] = useState<Book[]>([]);
  const [titleSortDesc, setTitleSortDesc] = useState(false);
  const [quantityByBook, setQuantityByBook] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const params = new URLSearchParams();
        selectedCategories.forEach((c) => {
          params.append('categories', c);
        });
        const qs = params.toString();
        const url = qs
          ? `${API_BASE}/Bookstore/GetBooks?${qs}`
          : `${API_BASE}/Bookstore/GetBooks`;

        const response = await fetch(url);
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Failed to load books from the API:', err);
      }
    };

    fetchBooks();
  }, [selectedCategories]);

  const sortedBooks = useMemo(() => {
    const copy = [...books];
    copy.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      return titleSortDesc ? -cmp : cmp;
    });
    return copy;
  }, [books, titleSortDesc]);

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      onCurrentPageChange(totalPages);
    }
  }, [currentPage, totalPages, onCurrentPageChange]);

  const pageBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBooks.slice(start, start + pageSize);
  }, [sortedBooks, currentPage, pageSize]);

  const goToPage = (p: number) => {
    onCurrentPageChange(Math.min(Math.max(1, p), totalPages));
  };

  const handlePageSizeChange = (value: number) => {
    onPageSizeChange(value);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getQty = (bookID: number) => {
    const q = quantityByBook[bookID];
    return q !== undefined && q >= 1 ? q : 1;
  };

  const setQty = (bookID: number, raw: number) => {
    const next = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
    setQuantityByBook((prev) => ({ ...prev, [bookID]: next }));
  };

  const handleAddToCart = (book: Book) => {
    const qty = getQty(book.bookID);
    addToCart(book, qty);
    navigate('/cart', {
      state: {
        from: `${location.pathname}${location.search}`,
        browseRestore,
      },
    });
  };

  return (
    <div>
      <header className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-sm-6 col-md-4 col-lg-3">
            <label htmlFor="pageSize" className="form-label mb-1">
              Results per page
            </label>
            <select
              id="pageSize"
              className="form-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="col-sm-6 col-md-auto">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setTitleSortDesc((d) => !d)}
            >
              Sort by title: {titleSortDesc ? 'Z → A' : 'A → Z'}
            </button>
          </div>
        </div>
      </header>

      {sortedBooks.length === 0 ? (
        <p className="text-muted">No books loaded yet.</p>
      ) : (
        <>
          <div className="row g-4">
            {pageBooks.map((b) => (
              <div key={b.bookID} className="col-md-6 col-xl-4">
                <div className="card book-card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h2 className="card-title h5">{b.title}</h2>
                    <ul className="list-unstyled small mb-3">
                      <li>By {b.author}</li>
                      <li>Published by {b.publisher}</li>
                      <li>ISBN: {b.isbn}</li>
                      <li>Category: {b.category}</li>
                      <li>Classification: {b.classification}</li>
                      <li>Page count: {b.pageCount}</li>
                      <li className="fw-semibold mt-2">Price: {money(Number(b.price))}</li>
                    </ul>
                    <div className="mt-auto border-top pt-3">
                      <label className="form-label small mb-1" htmlFor={`qty-${b.bookID}`}>
                        Quantity
                      </label>
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        <input
                          id={`qty-${b.bookID}`}
                          type="number"
                          min={1}
                          className="form-control"
                          style={{ maxWidth: '5rem' }}
                          value={getQty(b.bookID)}
                          onChange={(e) => setQty(b.bookID, Number(e.target.value))}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(b)}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav className="mt-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <p className="text-muted small mb-0">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, sortedBooks.length)} of {sortedBooks.length} books
            </p>
            <ul className="pagination mb-0 flex-wrap justify-content-center">
              <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
              </li>
              {pageNumbers.map((n) => (
                <li key={n} className={`page-item ${n === currentPage ? 'active' : ''}`}>
                  <button type="button" className="page-link" onClick={() => goToPage(n)}>
                    {n}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

export default BookList;
