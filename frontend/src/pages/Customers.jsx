import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({ cust_name: '', cust_city: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/retail/all-data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setCustomers(data.customers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCurrentCustomer({ ...currentCustomer, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setCurrentCustomer({ cust_name: '', cust_city: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer({ cust_name: '', cust_city: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentCustomer.cust_name || !currentCustomer.cust_city) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const url = isEditing 
        ? `/api/retail/customers/${currentCustomer._id}` 
        : '/api/retail/customers';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentCustomer),
      });

      if (!response.ok) throw new Error('Action failed');
      
      closeModal();
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const response = await fetch(`/api/retail/customers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading customers...</div>;
  if (error) return <div className="error">{error}</div>;

  const filteredCustomers = customers.filter(c => 
    c.cust_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cust_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="custom-header-flex">
        <h2>Customers List</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 10px 8px 35px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
            />
          </div>
          <button className="primary-btn" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div className="tables-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c._id}>
                  <td className="mono">{c._id}</td>
                  <td>{c.cust_name}</td>
                  <td>{c.cust_city}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="icon-btn edit" onClick={() => openEditModal(c)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(c._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Edit Customer' : 'Add New Customer'}</h3>
            <form onSubmit={handleSubmit} className="custom-form">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  type="text" 
                  name="cust_name" 
                  value={currentCustomer.cust_name} 
                  onChange={handleChange} 
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label>Customer City</label>
                <input 
                  type="text" 
                  name="cust_city" 
                  value={currentCustomer.cust_city} 
                  onChange={handleChange} 
                  placeholder="Enter city"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-btn">{isEditing ? 'Save Changes' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
