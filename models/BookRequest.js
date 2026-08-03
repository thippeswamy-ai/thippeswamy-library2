const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  studentDetails: {
    fullName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    department: { type: String, required: true },
    yearSemester: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, default: '' }
  },
  bookDetails: {
    title: { type: String, required: true },
    author: { type: String, default: '' },
    publisher: { type: String, default: '' },
    edition: { type: String, default: '' },
    reason: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Ordered', 'Available', 'Rejected'],
    default: 'Pending'
  },
  adminComments: { type: String, default: '' },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookRequest', requestSchema);
