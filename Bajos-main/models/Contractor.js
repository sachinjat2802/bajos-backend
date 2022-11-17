const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const ContractorSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  note: {
    type: String,
  },

}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});


const Contractor = mongoose.model("Contractor", ContractorSchema);
module.exports = Contractor;
