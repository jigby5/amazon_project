import { NavLink } from 'react-router-dom';

function SiteNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="mb-3" aria-label="Main">
      <ul className="nav nav-pills flex-wrap gap-1">
        <li className="nav-item">
          <NavLink className={linkClass} to="/" end>
            Shop
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={linkClass} to="/cart">
            Cart
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={linkClass} to="/adminbooks">
            Admin books
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default SiteNav;
