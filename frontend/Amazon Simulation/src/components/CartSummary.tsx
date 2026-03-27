import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { BrowseRestoreState } from '../types/BrowseRestore';
import './CartSummary.css';

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

type CartSummaryProps = {
  browseRestore: BrowseRestoreState;
};

function CartSummary({ browseRestore }: CartSummaryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartTotal, itemCount } = useCart();

  return (
    <button
      type="button"
      className="cart-summary"
      aria-label={`Shopping cart, ${itemCount} items, total ${money(cartTotal)}`}
      onClick={() =>
        navigate('/cart', {
          state: {
            from: `${location.pathname}${location.search}`,
            browseRestore,
          },
        })
      }
    >
      <span className="cart-summary__icon" aria-hidden>
        🛒
      </span>
      <span className="cart-summary__badge">{itemCount}</span>
      <span>{money(cartTotal)}</span>
    </button>
  );
}

export default CartSummary;
