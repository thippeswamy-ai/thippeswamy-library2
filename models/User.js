const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  permissions: {
    canManageBooks: { type: Boolean, default: true },
    canManageRequests: { type: Boolean, default: true },
    canManageAdmins: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
