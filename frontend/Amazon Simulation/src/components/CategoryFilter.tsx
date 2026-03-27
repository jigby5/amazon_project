import { useEffect, useState } from 'react';
import { API_BASE } from '../apiBase';
import './CategoryFilter.css';

type CategoryFilterProps = {
  selectedCategories: string[];
  onCategoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Loads categories from GET /Bookstore/GetBookCategories; selection is owned by the parent page.
 */
function CategoryFilter({ selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/Bookstore/GetBookCategories`);
        const data: string[] = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load book categories from the API:', err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="mb-4" aria-label="Filter books by category">
      <h2 className="h5 mb-3">Categories</h2>

      {categories.length === 0 ? (
        <p className="text-muted small mb-0">Loading categories…</p>
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {categories.map((category) => {
            const inputId = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;

            return (
              <div key={category} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={inputId}
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={onCategoryChange}
                />
                <label className="form-check-label" htmlFor={inputId}>
                  {category}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CategoryFilter;
