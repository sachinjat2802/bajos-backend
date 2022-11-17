const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ProductSchema = new mongoose.Schema({
  name: {
    type: String
  },
  srNo: {
    type: Number
  },
  sku: {
    type: String
  },
  colour: {
    type: String,
  },
  size: {
    type: String
  },
  category: {
    type: String
  },
  contains: [{
    rawMaterial: {
      type: ObjectId,
      ref: 'RawMaterial'
    },
    rawQuantity: {
      type: Number
    },
  }],
  availableQty: {
    type: Number
  },
  price: {
    type: Number
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

ProductSchema.plugin(AutoIncrement, { inc_field: 'srNo' });

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
