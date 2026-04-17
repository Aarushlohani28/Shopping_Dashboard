const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  cust_name: {
    type: String,
    required: true,
  },
  cust_city: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
