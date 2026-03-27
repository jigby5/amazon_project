/** Snapshot of the books browse UI so we can restore after visiting the cart. */
export type BrowseRestoreState = {
  selectedCategories: string[];
  currentPage: number;
  pageSize: number;
};
