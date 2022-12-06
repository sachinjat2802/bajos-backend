const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  name: {
    type: String
  },
  types:{
    type:[]
  }
  
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});


const Unit = mongoose.model("Unit", UnitSchema);
module.exports = Unit;
