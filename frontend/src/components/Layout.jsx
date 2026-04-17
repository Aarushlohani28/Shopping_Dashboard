import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Box, Users, Package, ShoppingCart, Sun, Moon } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Layout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Box className="logo-icon" />
          <h2>RetailDB</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/tables" className={location.pathname === '/tables' ? 'active' : ''}>
            <Database size={20} />
            <span>Database View</span>
          </Link>
          <Link to="/customers" className={location.pathname === '/customers' ? 'active' : ''}>
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link to="/add-order" className={location.pathname === '/add-order' ? 'active' : ''}>
            <ShoppingCart size={20} />
            <span>Add Order</span>
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Retail Data Analytics</h2>
          <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
