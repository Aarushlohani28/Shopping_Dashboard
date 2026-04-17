import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, CheckCircle } from 'lucide-react';

const AddOrder = () => {
  const [customers, setCustomers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderProducts, setOrderProducts] = useState([{ prod_id: '', qty: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/retail/all-data');
      if (!response.ok) throw new Error('Failed to fetch initial data');
      const data = await response.json();
      setCustomers(data.customers);
      setAvailableProducts(data.products);
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...orderProducts];
    newProducts[index][field] = value;
    setOrderProducts(newProducts);
  };

  const addProductRow = () => {
    setOrderProducts([...orderProducts, { prod_id: '', qty: 1 }]);
  };

  const removeProductRow = (index) => {
    const newProducts = orderProducts.filter((_, i) => i !== index);
    setOrderProducts(newProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedCustomer) {
      alert("Please select a customer.");
      setIsSubmitting(false);
      return;
    }
    
    const validProducts = orderProducts.filter(p => p.prod_id);
    if (validProducts.length === 0) {
      alert("Please select at least one product.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      cust_id: selectedCustomer,
      products: validProducts
    };

    try {
      const response = await fetch('/api/retail/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error saving order');
      
      alert(data.message);
      setSelectedCustomer('');
      setOrderProducts([{ prod_id: '', qty: 1 }]);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as completed?")) return;
    try {
        const response = await fetch(`/api/retail/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });
        if (!response.ok) throw new Error('Failed to update order status');
        fetchData();
    } catch (err) {
        alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading form data...</div>;
  if (error) return <div className="error">{error}</div>;

  const pendingOrders = orders.filter(o => !o.status || o.status === 'pending');

  return (
    <div className="page-container add-order-grid">
      
      {/* Create Order Section */}
      <div>
        <h2 style={{ marginBottom: '24px' }}>Create New Order</h2>
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSubmit} className="custom-form">
            <div className="form-group">
              <label>Select Customer</label>
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                <option value="">-- Choose a customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.cust_name} ({c.cust_city})</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '30px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Order Items</h3>
              <button type="button" className="icon-btn edit" onClick={addProductRow} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <PlusCircle size={16} /> Add Item
              </button>
            </div>

            {orderProducts.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '15px', background: 'var(--bg-dark)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Product</label>
                  <select value={item.prod_id} onChange={(e) => handleProductChange(index, 'prod_id', e.target.value)}>
                    <option value="">-- Select Product --</option>
                    {availableProducts.map(p => (
                      <option key={p._id} value={p._id}>{p.prod_name} - ${p.price}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ width: '100px', marginBottom: 0 }}>
                  <label>Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.qty} 
                    onChange={(e) => handleProductChange(index, 'qty', parseInt(e.target.value))} 
                  />
                </div>

                <button 
                  type="button" 
                  className="icon-btn delete" 
                  onClick={() => removeProductRow(index)}
                  disabled={orderProducts.length === 1}
                  style={{ padding: '10px', height: '42px' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Order Total:</h3>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-indigo)' }}>
                ${orderProducts.reduce((sum, item) => {
                  const product = availableProducts.find(p => p._id === item.prod_id);
                  return sum + (product && item.qty ? product.price * item.qty : 0);
                }, 0).toFixed(2)}
              </span>
            </div>

            <div className="form-actions" style={{ marginTop: '30px' }}>
              <button type="submit" className="primary-btn" disabled={isSubmitting} style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}>
                {isSubmitting ? 'Saving...' : 'Submit Order'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pending Orders Queue Section */}
      <div>
        <h2 style={{ marginBottom: '24px' }}>Pending Orders</h2>
        <div className="card" style={{ padding: '20px', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {pendingOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No pending orders.</p>
          ) : (
            pendingOrders.map(order => (
              <div key={order._id} style={{ padding: '15px', borderRadius: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-orange)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Order ID: <span className="mono">{order._id.substring(order._id.length - 6)}</span></h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(order.ord_date).toLocaleDateString()}</span>
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-orange)' }}>PENDING</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Customer: {order.cust_id?.cust_name || 'Unknown'}
                  </span>
                  <button onClick={() => handleCloseOrder(order._id)} className="icon-btn edit" style={{ display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px', backgroundColor: 'var(--bg-panel)' }}>
                    <CheckCircle size={14} /> Close
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default AddOrder;
