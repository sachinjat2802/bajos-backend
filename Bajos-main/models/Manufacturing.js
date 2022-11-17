const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const ManufacturingSchema = new mongoose.Schema({
  contractorId: {
    type: ObjectId,
    ref: 'Contractor'
  },
  productId: {
    type: ObjectId,
    ref: 'Product'
  },
  rawMaterial: [{
    materialId: {
      type: ObjectId,
      ref: 'RawMaterial'
    },
    price: {
      type: Number
    },
    quantityAssigned: {
      type: Number
    },
    expectedQuantity: {
      type: Number
    },
    actualRecieved: {
      type: Number
    }
  }],
  productAssignedOn: {
    type: Date
  },
  productRecievedOn: {
    type: Date
  },
  expectedProductQty: {
    type: Number
  },
  recievedProductQty: {
    type: Number,
  },
  labourCost: {
    type: Number,
  },
  costPerPcs: {
    type: String
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

const Manufacturing = mongoose.model("Manufacturing", ManufacturingSchema);
module.exports = Manufacturing;
