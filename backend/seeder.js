const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const OrderDetail = require('./models/OrderDetail');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Customer.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await OrderDetail.deleteMany();

    console.log('Generating Customers...');
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const customersInfo = [];
    for (let i = 1; i <= 25; i++) {
      customersInfo.push({
        cust_name: `Customer ${i}`,
        cust_city: cities[Math.floor(Math.random() * cities.length)]
      });
    }
    const createdCustomers = await Customer.insertMany(customersInfo);

    console.log('Generating Products...');
    const productsInfo = [];
    for (let i = 1; i <= 25; i++) {
      productsInfo.push({
        prod_id: `PROD-${1000 + i}`,
        prod_name: `Product ${i}`,
        price: Number((Math.random() * 100 + 10).toFixed(2)) // random price $10 to $110
      });
    }
    const createdProducts = await Product.insertMany(productsInfo);

    console.log('Generating Orders...');
    const ordersInfo = [];
    for (let i = 1; i <= 25; i++) {
      // Pick a random customer 
      const randomCustomer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      // Random date within last year
      const randomDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
      ordersInfo.push({
        cust_id: randomCustomer._id,
        ord_date: randomDate
      });
    }
    const createdOrders = await Order.insertMany(ordersInfo);

    console.log('Generating Order Details...');
    const orderDetailsInfo = [];
    for (let i = 1; i <= 100; i++) {
        // distribute 100 details into 25 orders
        const randomOrder = createdOrders[Math.floor(Math.random() * createdOrders.length)];
        const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        orderDetailsInfo.push({
            ord_id: randomOrder._id,
            prod_id: randomProduct._id,
            qty: Math.floor(Math.random() * 5) + 1 // quantity 1 to 5
        });
    }
    await OrderDetail.insertMany(orderDetailsInfo);

    console.log('Successfully seeded database!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
