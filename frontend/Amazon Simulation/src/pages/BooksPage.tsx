import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BookList from '../components/BookList';
import CartSummary from '../components/CartSummary';
import CategoryFilter from '../components/CategoryFilter';
import WelcomeBand from '../components/WelcomeBand';
import type { BrowseRestoreState } from '../types/BrowseRestore';

function readBrowseRestore(location: ReturnType<typeof useLocation>): BrowseRestoreState | undefined {
  return (location.state as { browseRestore?: BrowseRestoreState } | null)?.browseRestore;
}

function BooksPage() {
  const location = useLocation();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const br = readBrowseRestore(location);
    return br?.selectedCategories ? [...br.selectedCategories] : [];
  });
  const [currentPage, setCurrentPage] = useState(() => readBrowseRestore(location)?.currentPage ?? 1);
  const [pageSize, setPageSize] = useState(() => readBrowseRestore(location)?.pageSize ?? 5);

  const browseRestore: BrowseRestoreState = useMemo(
    () => ({
      selectedCategories,
      currentPage,
      pageSize,
    }),
    [selectedCategories, currentPage, pageSize],
  );

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentPage(1);

    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== value));
    } else {
      setSelectedCategories([...selectedCategories, value]);
    }
  };

  return (
    <div className="container py-4 pt-5 position-relative text-start">
      <CartSummary browseRestore={browseRestore} />

      <div className="row g-4">
        <div className="col-12">
          <header className="row align-items-center mb-0">
            <div className="col">
              <h1 className="mb-0">Bookstore</h1>
            </div>
          </header>
        </div>

        <div className="col-12">
          <WelcomeBand />
        </div>

        <div className="col-12 col-lg-4 col-xl-3">
          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoryChange={handleCheckboxChange}
          />
        </div>

        <div className="col-12 col-lg-8 col-xl-9">
          <BookList
            selectedCategories={selectedCategories}
            currentPage={currentPage}
            onCurrentPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(next) => {
              setPageSize(next);
              setCurrentPage(1);
            }}
            browseRestore={browseRestore}
          />
        </div>
      </div>
    </div>
  );
}

export default BooksPage;
