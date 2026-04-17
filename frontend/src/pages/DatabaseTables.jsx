import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DatabaseTables = () => {
    const [data, setData] = useState({ customers: [], products: [], orders: [], orderDetails: [] });
    const [activeTab, setActiveTab] = useState('customers');
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const toggleExpand = (id) => {
        if (expandedOrderId === id) setExpandedOrderId(null);
        else setExpandedOrderId(id);
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const res = await axios.get('/api/retail/all-data');
                setData(res.data);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <div className="loading">Loading Data...</div>;

    const tabs = [
        { id: 'customers', label: 'Customers', count: data.customers.length },
        { id: 'products', label: 'Products', count: data.products.length },
        { id: 'orders', label: 'Orders', count: data.orders.length },
        { id: 'orderDetails', label: 'Order Details', count: data.orderDetails.length }
    ];

    return (
        <div className="tables-container">
            <div className="tabs-header">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label} <span className="badge">{tab.count}</span>
                    </button>
                ))}
            </div>

            <div className="table-wrapper">
                {activeTab === 'customers' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Object ID</th>
                                <th>Customer Name</th>
                                <th>City</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.customers.map(c => (
                                <tr key={c._id}>
                                    <td><span className="mono">{c._id}</span></td>
                                    <td>{c.cust_name}</td>
                                    <td>{c.cust_city}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'products' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product ID String</th>
                                <th>Product Name</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.products.map(p => (
                                <tr key={p._id}>
                                    <td><span className="mono">{p.prod_id}</span></td>
                                    <td>{p.prod_name}</td>
                                    <td>${p.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'orders' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer Name (ref)</th>
                                <th>Order Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.orders.map(o => (
                                <React.Fragment key={o._id}>
                                    <tr onClick={() => toggleExpand(o._id)} style={{ cursor: 'pointer' }}>
                                        <td><span className="mono">{o._id}</span></td>
                                        <td>{o.cust_id?.cust_name}</td>
                                        <td>{new Date(o.ord_date).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', 
                                                backgroundColor: (!o.status || o.status === 'pending') ? 'rgba(249, 115, 22, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                                                color: (!o.status || o.status === 'pending') ? 'var(--accent-orange)' : '#22c55e'
                                            }}>
                                                {(!o.status || o.status === 'pending') ? 'PENDING' : 'COMPLETED'}
                                            </span>
                                        </td>
                                    </tr>
                                    {expandedOrderId === o._id && (
                                        <tr style={{ backgroundColor: 'var(--bg-dark)' }}>
                                            <td colSpan="4" style={{ padding: '0' }}>
                                                <div style={{ display: 'flex', gap: '15px', padding: '15px', overflowX: 'auto' }}>
                                                    {data.orderDetails.filter(od => od.ord_id?._id === o._id).map(od => (
                                                        <div key={od._id} style={{ minWidth: '150px', maxWidth: '200px', background: 'var(--bg-panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                            {od.prod_id?.image ? (
                                                                <img src={od.prod_id?.image} alt={od.prod_id?.prod_name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100px', background: '#334155', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>No Image</div>
                                                            )}
                                                            <div style={{ padding: '5px' }}>
                                                                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>{od.prod_id?.prod_name}</h4>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                                    <span>Qty: {od.qty}</span>
                                                                    <span>${od.prod_id?.price}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {data.orderDetails.filter(od => od.ord_id?._id === o._id).length === 0 && (
                                                        <span style={{ color: 'var(--text-secondary)' }}>No items found for this order.</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'orderDetails' && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Detail ID</th>
                                <th>Order ID (ref)</th>
                                <th>Product Name (ref)</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.orderDetails.map(od => (
                                <tr key={od._id}>
                                    <td><span className="mono">{od._id}</span></td>
                                    <td><span className="mono">{od.ord_id?._id}</span></td>
                                    <td>{od.prod_id?.prod_name} ( ${od.prod_id?.price} )</td>
                                    <td>{od.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DatabaseTables;
