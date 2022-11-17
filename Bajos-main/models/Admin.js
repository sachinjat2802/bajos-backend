const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  phone: {
    type: String,
  },
  passwordHash: {
    type: String
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});


const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
