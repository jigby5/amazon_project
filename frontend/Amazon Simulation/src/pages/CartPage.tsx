import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { BrowseRestoreState } from '../types/BrowseRestore';

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

type CartLocationState = {
  from?: string;
  browseRestore?: BrowseRestoreState;
};

function CartPage() {
  const location = useLocation();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  const browseRestore = useMemo(() => {
    const state = location.state as CartLocationState | null;
    return state?.browseRestore;
  }, [location.state]);

  const homeLinkState = browseRestore ? { browseRestore } : undefined;

  return (
    <div className="container py-4 text-start">
      <div className="row g-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" state={homeLinkState}>
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Cart
              </li>
            </ol>
          </nav>
        </div>

        <div className="col-12">
          <div className="row align-items-center flex-column flex-md-row">
            <div className="col col-12 col-md-8 mb-3 mb-md-0">
              <h1 className="h2 mb-0">Your cart</h1>
            </div>
            <div className="col col-12 col-md-4 text-md-end">
              <Link to="/" className="btn btn-outline-primary" state={homeLinkState}>
                Back to bookstore
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12">
          {cart.length === 0 ? (
            <p className="text-muted mb-0">Your cart is empty.</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col" className="text-end">
                        Unit price
                      </th>
                      <th scope="col" className="text-end" style={{ minWidth: '8rem' }}>
                        Quantity
                      </th>
                      <th scope="col" className="text-end">
                        Subtotal
                      </th>
                      <th scope="col">
                        <span className="visually-hidden">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const line = item.unitPrice * item.quantity;
                      return (
                        <tr key={item.bookID}>
                          <td>{item.title}</td>
                          <td className="text-end">{money(item.unitPrice)}</td>
                          <td className="text-end">
                            <input
                              type="number"
                              min={1}
                              className="form-control form-control-sm ms-auto"
                              style={{ maxWidth: '5rem' }}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.bookID, Number(e.target.value))
                              }
                              aria-label={`Quantity for ${item.title}`}
                            />
                          </td>
                          <td className="text-end fw-semibold">{money(line)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.bookID)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row" colSpan={3} className="text-end">
                        Total
                      </th>
                      <td className="text-end fs-5">{money(cartTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="row">
                <div className="col-12 col-sm-auto">
                  <button type="button" className="btn btn-outline-danger" onClick={clearCart}>
                    Clear cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPage;
