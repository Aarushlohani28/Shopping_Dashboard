const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  ord_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  prod_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  qty: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
