const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getMongoStatus, DATA_DIR } = require('../config/db');

const USERS_FILE = path.join(DATA_DIR, 'users.json');

function readUsersFromFile() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeUsersToFile(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Seed default Super Admin
async function seedDefaultSuperAdmin() {
  const primarySuperAdmin = {
    _id: "admin_super_thippeswamy",
    username: "kthippeswamy109@gmail.com",
    password: bcrypt.hashSync("12345678", 10),
    fullName: "K. Thippeswamy (Super Admin)",
    email: "kthippeswamy109@gmail.com",
    role: "superadmin",
    permissions: { canManageBooks: true, canManageRequests: true, canManageAdmins: true },
    createdAt: new Date().toISOString()
  };

  const defaultAdmin = {
    _id: "admin_super",
    username: "superadmin",
    password: bcrypt.hashSync("admin123", 10),
    fullName: "Chief Librarian (Super Admin)",
    email: "librarian@artscollegeanantapur.ac.in",
    role: "superadmin",
    permissions: { canManageBooks: true, canManageRequests: true, canManageAdmins: true },
    createdAt: new Date().toISOString()
  };

  const defaultRegularAdmin = {
    _id: "admin_regular",
    username: "admin",
    password: bcrypt.hashSync("admin123", 10),
    fullName: "Assistant Librarian",
    email: "assistant@artscollegeanantapur.ac.in",
    role: "admin",
    permissions: { canManageBooks: true, canManageRequests: true, canManageAdmins: false },
    createdAt: new Date().toISOString()
  };

  if (!fs.existsSync(USERS_FILE)) {
    writeUsersToFile([primarySuperAdmin, defaultAdmin, defaultRegularAdmin]);
  } else {
    let users = readUsersFromFile();
    const idx = users.findIndex(u => u.username.toLowerCase() === 'kthippeswamy109@gmail.com');
    if (idx !== -1) {
      users[idx].password = bcrypt.hashSync("12345678", 10);
      users[idx].role = "superadmin";
      users[idx].permissions = { canManageBooks: true, canManageRequests: true, canManageAdmins: true };
    } else {
      users.unshift(primarySuperAdmin);
    }
    writeUsersToFile(users);
  }

  if (getMongoStatus()) {
    const existing = await User.findOne({ username: 'kthippeswamy109@gmail.com' });
    if (!existing) {
      await User.create(primarySuperAdmin);
    } else {
      existing.password = bcrypt.hashSync("12345678", 10);
      existing.role = "superadmin";
      await existing.save();
    }
  }
}

// Call seed once on load
seedDefaultSuperAdmin();

const SECRET = process.env.JWT_SECRET || 'arts_college_anantapur_secret_key_2026';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password.' });
    }

    let user = null;
    if (getMongoStatus()) {
      user = await User.findOne({ username: username.trim() });
    } else {
      const users = readUsersFromFile();
      user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid Username or Password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Username or Password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, fullName: user.fullName },
      SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server login error', error: err.message });
  }
};

// Super Admin Controller Operations
exports.getAllAdmins = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const users = await User.find({}, '-password');
      return res.json(users);
    } else {
      const users = readUsersFromFile().map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      return res.json(users);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving administrators' });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { username, password, fullName, email, role, permissions } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'Username, password and Full Name are required.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newAdminData = {
      username: username.trim(),
      password: hashedPassword,
      fullName,
      email: email || '',
      role: role || 'admin',
      permissions: permissions || { canManageBooks: true, canManageRequests: true, canManageAdmins: false },
      createdAt: new Date().toISOString()
    };

    if (getMongoStatus()) {
      const existing = await User.findOne({ username: newAdminData.username });
      if (existing) return res.status(400).json({ message: 'Username already exists' });
      const newUser = new User(newAdminData);
      await newUser.save();
      const { password, ...created } = newUser.toObject();
      return res.status(201).json({ message: 'Admin account created successfully', user: created });
    } else {
      let users = readUsersFromFile();
      if (users.some(u => u.username.toLowerCase() === newAdminData.username.toLowerCase())) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      newAdminData._id = 'admin_' + Date.now();
      users.push(newAdminData);
      writeUsersToFile(users);
      const { password, ...created } = newAdminData;
      return res.status(201).json({ message: 'Admin account created successfully', user: created });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to create admin', error: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (getMongoStatus()) {
      const user = await User.findById(id);
      if (user && user.role === 'superadmin') {
        return res.status(400).json({ message: 'Cannot delete Super Admin account.' });
      }
      await User.findByIdAndDelete(id);
      return res.json({ message: 'Admin removed successfully' });
    } else {
      let users = readUsersFromFile();
      const target = users.find(u => u._id === id);
      if (target && target.role === 'superadmin') {
        return res.status(400).json({ message: 'Cannot delete Super Admin account.' });
      }
      users = users.filter(u => u._id !== id);
      writeUsersToFile(users);
      return res.json({ message: 'Admin removed successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove admin' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long.' });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    if (getMongoStatus()) {
      await User.findByIdAndUpdate(id, { password: hashedPassword });
      return res.json({ message: 'Password reset successfully' });
    } else {
      let users = readUsersFromFile();
      const idx = users.findIndex(u => u._id === id);
      if (idx === -1) return res.status(404).json({ message: 'User not found' });
      users[idx].password = hashedPassword;
      writeUsersToFile(users);
      return res.json({ message: 'Password reset successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
};
