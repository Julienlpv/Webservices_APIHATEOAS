const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 128 },
  description: { type: String, required: true, maxlength: 2048 },
  date: { type: Date, required: true },
  rating: { type: Number, min: 0, max: 5 },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
});

const Film = mongoose.model('Film', filmSchema);
module.exports = Film;
