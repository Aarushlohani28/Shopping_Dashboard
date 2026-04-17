import { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ prod_id: '', prod_name: '', price: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/retail/all-data');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const openAddModal = () => {
    setCurrentProduct({ prod_id: '', prod_name: '', price: '' });
    setImageFile(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setImageFile(null);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({ prod_id: '', prod_name: '', price: '' });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentProduct.prod_id || !currentProduct.prod_name || !currentProduct.price) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const url = isEditing 
        ? `/api/retail/products/${currentProduct._id}` 
        : '/api/retail/products';
      const method = isEditing ? 'PUT' : 'POST';

      const formData = new FormData();
      formData.append('prod_id', currentProduct.prod_id);
      formData.append('prod_name', currentProduct.prod_name);
      formData.append('price', currentProduct.price);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Action failed');
      
      closeModal();
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/retail/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };


  if (loading) return <div className="loading">Loading products...</div>;

  const filteredProducts = products.filter(p => 
    p.prod_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.prod_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="custom-header-flex">
        <h2>Available Products</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 10px 8px 35px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-primary)', width: '250px' }}
            />
          </div>
          <button className="primary-btn" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-ghost-tile" style={{ position: 'relative' }}>
              
              {product.image ? (
                <img src={product.image} alt={product.prod_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <Package size={48} className="ghost-icon" />
                  <div className="ghost-shimmer"></div>
                </>
              )}

              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 10 }}>
                <button className="icon-btn edit" onClick={() => openEditModal(product)} style={{ backgroundColor: 'var(--bg-panel)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn delete" onClick={() => handleDelete(product._id)} style={{ backgroundColor: 'var(--bg-panel)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="product-info">
              <span className="product-code">{product.prod_id}</span>
              <h3>{product.prod_name}</h3>
              <p className="product-price">${product.price}</p>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            No products available.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} className="custom-form">
              <div className="form-group">
                <label>Product Code</label>
                <input 
                  type="text" 
                  name="prod_id" 
                  value={currentProduct.prod_id} 
                  onChange={handleChange} 
                  placeholder="e.g. PRD001"
                />
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  name="prod_name" 
                  value={currentProduct.prod_name} 
                  onChange={handleChange} 
                  placeholder="Enter product title"
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input 
                  type="number" 
                  name="price" 
                  value={currentProduct.price} 
                  onChange={handleChange} 
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="form-group">
                <label>Product Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }}
                  />
                  {imageFile && <ImageIcon size={20} color="var(--accent-indigo)" />}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="primary-btn">{isEditing ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
