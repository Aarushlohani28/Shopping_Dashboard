import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Package, MapPin, ClipboardList } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];

const Dashboard = () => {
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCity, setTopCity] = useState(null);
  const [orderStats, setOrderStats] = useState({ pendingCount: 0, completedCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [custRes, prodRes, cityRes, orderRes] = await Promise.all([
          axios.get('/api/retail/top-customers'),
          axios.get('/api/retail/top-products'),
          axios.get('/api/retail/top-city'),
          axios.get('/api/retail/order-stats')
        ]);
        setTopCustomers(custRes.data);
        setTopProducts(prodRes.data);
        setTopCity(cityRes.data);
        setOrderStats(orderRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading">Loading Analytics...</div>;

  return (
    <div className="dashboard">
      <div className="stats-row">
        <div className="stat-card spark">
          <div className="stat-icon-wrapper blue">
            <Trophy size={24} />
          </div>
          <div className="stat-details">
            <p>Top Ranked City</p>
            <h3>{topCity ? topCity._id : 'N/A'}</h3>
            <span>{topCity ? topCity.customerCount : 0} Customers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Package size={24} />
          </div>
          <div className="stat-details">
            <p>Best Product</p>
            <h3>{topProducts.length > 0 ? topProducts[0].name : 'N/A'}</h3>
            <span>{topProducts.length > 0 ? topProducts[0].totalQuantitySold : 0} sold</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <ClipboardList size={24} />
          </div>
          <div className="stat-details">
            <p>Orders Tracking</p>
            <h3>{orderStats.pendingCount} <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Open</span></h3>
            <span style={{ color: '#22c55e' }}>{orderStats.completedCount} Completed</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Top 5 Customers (by Revenue)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: '#334155'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="totalSpent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top 5 Products (by Quantity Sold)</h3>
          <div className="chart-container">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="totalQuantitySold"
                  nameKey="name"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
               {topProducts.map((product, index) => (
                 <div key={index} className="legend-item">
                   <div className="color-dot" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                   <span>{product.name} ({product.totalQuantitySold})</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
