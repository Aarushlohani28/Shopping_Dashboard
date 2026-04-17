const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');

// @desc    Get top 5 customers by revenue
// @route   GET /api/retail/top-customers
const getTopCustomers = async (req, res) => {
    try {
        const topCustomers = await OrderDetail.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'prod_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                // Calculate revenue for this line item
                $addFields: {
                    revenue: { $multiply: ['$qty', '$product.price'] }
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'ord_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $group: {
                    _id: '$order.cust_id',
                    totalSpent: { $sum: '$revenue' }
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerDetails'
                }
            },
            { $unwind: '$customerDetails' },
            {
                $project: {
                    _id: 0,
                    customerId: '$_id',
                    name: '$customerDetails.cust_name',
                    city: '$customerDetails.cust_city',
                    totalSpent: 1
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 }
        ]);
        
        res.json(topCustomers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get top 5 products by quantity sold
// @route   GET /api/retail/top-products
const getTopProducts = async (req, res) => {
    try {
        const topProducts = await OrderDetail.aggregate([
            {
                $group: {
                    _id: '$prod_id',
                    totalQuantitySold: { $sum: '$qty' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    prodCode: '$productDetails.prod_id',
                    name: '$productDetails.prod_name',
                    price: '$productDetails.price',
                    totalQuantitySold: 1
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 }
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get top city with maximum customers
// @route   GET /api/retail/top-city
const getTopCity = async (req, res) => {
    try {
        const topCity = await Customer.aggregate([
            {
                $group: {
                    _id: '$cust_city',
                    customerCount: { $sum: 1 }
                }
            },
            { $sort: { customerCount: -1 } },
            { $limit: 1 }
        ]);

        res.json(topCity[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all data to show in tables (Paginated simply or returning all since it's small)
// @route   GET /api/retail/all-data
const getAllData = async (req, res) => {
    try {
        const customers = await Customer.find({});
        const products = await Product.find({});
        const orders = await Order.find({}).populate('cust_id', 'cust_name');
        const orderDetails = await OrderDetail.find({})
                                    .populate('ord_id', 'ord_date')
                                    .populate('prod_id', 'prod_name price');

        res.json({ customers, products, orders, orderDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Create a new customer
// @route   POST /api/retail/customers
const createCustomer = async (req, res) => {
    try {
        const { cust_name, cust_city } = req.body;
        if (!cust_name || !cust_city) {
            return res.status(400).json({ message: 'Name and city are required' });
        }
        const newCustomer = await Customer.create({ cust_name, cust_city });
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a customer
// @route   PUT /api/retail/customers/:id
const updateCustomer = async (req, res) => {
    try {
        const { cust_name, cust_city } = req.body;
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        if (cust_name) customer.cust_name = cust_name;
        if (cust_city) customer.cust_city = cust_city;
        const updatedCustomer = await customer.save();
        res.json(updatedCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/retail/customers/:id
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        await customer.deleteOne();
        res.json({ message: 'Customer removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new order with details
// @route   POST /api/retail/orders
const addOrder = async (req, res) => {
    try {
        const { cust_id, products } = req.body; // products is array of { prod_id, qty }
        if (!cust_id || !products || products.length === 0) {
            return res.status(400).json({ message: 'Customer and at least one product are required' });
        }
        
        // Validate customer
        const customer = await Customer.findById(cust_id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Validate products and quantities
        for (let item of products) {
            if (!item.prod_id || !item.qty || item.qty <= 0) {
                 return res.status(400).json({ message: 'Valid product ID and positive quantity are required' });
            }
            const product = await Product.findById(item.prod_id);
            if (!product) {
                 return res.status(404).json({ message: `Product with id ${item.prod_id} not found` });
            }
        }

        // Create Order
        const order = await Order.create({ cust_id });

        // Create OrderDetails
        const orderDetailsEntries = products.map(item => ({
            ord_id: order._id,
            prod_id: item.prod_id,
            qty: item.qty
        }));

        await OrderDetail.insertMany(orderDetailsEntries);

        res.status(201).json({ message: 'Order created successfully', orderId: order._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new product
// @route   POST /api/retail/products
const createProduct = async (req, res) => {
    try {
        const { prod_id, prod_name, price } = req.body;
        if (!prod_id || !prod_name || !price) {
            return res.status(400).json({ message: 'Code, name, and price are required' });
        }
        
        const exists = await Product.findOne({ prod_id });
        if (exists) {
            return res.status(400).json({ message: 'Product Code already exists' });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : null;
        const newProduct = await Product.create({ prod_id, prod_name, price, image });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a product
// @route   PUT /api/retail/products/:id
const updateProduct = async (req, res) => {
    try {
        const { prod_id, prod_name, price } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (prod_id && prod_id !== product.prod_id) {
            const exists = await Product.findOne({ prod_id });
            if (exists) {
                return res.status(400).json({ message: 'Product Code already exists' });
            }
            product.prod_id = prod_id;
        }

        if (prod_name) product.prod_name = prod_name;
        if (price) product.price = price;
        if (req.file) product.image = `/uploads/${req.file.filename}`;
        
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/retail/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Update order status
// @route   PUT /api/retail/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = status;
        const updatedOrder = await order.save();
        
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get order statistics (pending vs completed)
// @route   GET /api/retail/order-stats
const getOrderStats = async (req, res) => {
    try {
        const pendingCount = await Order.countDocuments({ $or: [{ status: 'pending' }, { status: { $exists: false } }] });
        const completedCount = await Order.countDocuments({ status: 'completed' });
        
        res.json({ pendingCount, completedCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTopCustomers,
    getTopProducts,
    getTopCity,
    getAllData,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrderStatus,
    getOrderStats
};
