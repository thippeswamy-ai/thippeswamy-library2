const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, default: 0 },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '/assets/default-cover.jpg' },
  availability: { type: String, enum: ['Available', 'Issued'], default: 'Available' },
  location: {
    floor: { type: String, default: 'Ground Floor' },
    section: { type: String, default: 'General' },
    rack: { type: String, default: 'R-01' },
    shelf: { type: String, default: 'S-1' },
    row: { type: String, default: 'Row-1' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);
