const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const RawMaterialSchema = new mongoose.Schema({
  name: {
    type: String
  },
  serialNo: {
    type: Number
  },
  sku: {
    type: String
  },
  quantityAvailable: {
    type: Number
  },
  measurementUnit: {
    type: String,
//enum: ["KG", "Pcs","Inch","Meters","Centimeters","Grams"]
  },
  price: {
    type: Number
  },
  updateLogs:{
    type:[Object]
  },
  contractorUseLogs:{
    type:[Object]
  },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

RawMaterialSchema.plugin(AutoIncrement, { inc_field: 'serialNo' });

const RawMaterial = mongoose.model("RawMaterial", RawMaterialSchema);
module.exports = RawMaterial;
