const { object } = require('joi');
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
    type: String,
  //   enum:["Doormat" ,
  //    "Sofa covers" ,
  //    "Cushion covers",
  //     "Bedsheets" ,
  //     "Bed covers" ,
  //      "Diwan sets",
  //     "Fridge tops",
  //     "Table covers"]
   },
  contains: [Object],
  availableQty: {
    type: Number
  },
  price: {
    type: Number
  },
  updateLogs:{
    type:[Object]
  },
  status:{
    type:String,
    default:"processing",
  },
  
  updateRawMaterialsLogs:{
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

ProductSchema.plugin(AutoIncrement, { inc_field: 'srNo' });

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
