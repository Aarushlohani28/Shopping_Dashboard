const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/retailController');

router.get('/top-customers', getTopCustomers);
router.get('/top-products', getTopProducts);
router.get('/top-city', getTopCity);
router.get('/all-data', getAllData);
router.get('/order-stats', getOrderStats);

router.post('/customers', createCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);

router.post('/orders', addOrder);
router.put('/orders/:id/status', updateOrderStatus);

router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
