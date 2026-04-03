import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Book } from '../types/Book';
import type { CartItem } from '../types/CartItem';

type CartContextValue = {
  cart: CartItem[];
  addToCart: (book: Book, quantity: number) => void;
  removeFromCart: (bookID: number) => void;
  updateQuantity: (bookID: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((book: Book, quantity: number) => {
    if (quantity < 1 || !Number.isFinite(quantity)) return;

    const unitPrice = Number(book.price);
    if (!Number.isFinite(unitPrice)) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.bookID === book.bookID);
      if (existing) {
        return prev.map((item) =>
          item.bookID === book.bookID
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          bookID: book.bookID,
          title: book.title,
          unitPrice,
          quantity,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((bookID: number) => {
    setCart((prev) => prev.filter((item) => item.bookID !== bookID));
  }, []);

  const updateQuantity = useCallback((bookID: number, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) {
      setCart((prev) => prev.filter((item) => item.bookID !== bookID));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.bookID === bookID ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
