const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  prod_id: {
    type: String,
    required: true,
    unique: true
  },
  prod_name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
