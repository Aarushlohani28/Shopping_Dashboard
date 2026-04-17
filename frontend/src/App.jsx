import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DatabaseTables from './pages/DatabaseTables';
import Customers from './pages/Customers';
import Products from './pages/Products';
import AddOrder from './pages/AddOrder';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tables" element={<DatabaseTables />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="add-order" element={<AddOrder />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
