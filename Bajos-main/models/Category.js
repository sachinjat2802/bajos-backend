const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});


const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
