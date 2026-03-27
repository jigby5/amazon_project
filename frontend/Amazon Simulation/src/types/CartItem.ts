/**
 * One line in the shopping cart. `unitPrice` is captured when the item is added
 * so totals stay stable if the catalog price changes later in the session.
 */
export interface CartItem {
  bookID: number;
  title: string;
  unitPrice: number;
  quantity: number;
}
