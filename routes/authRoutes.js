const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth');

router.post('/login', authController.login);

// Super Admin User Management Routes
router.get('/admins', verifyToken, requireSuperAdmin, authController.getAllAdmins);
router.post('/admins', verifyToken, requireSuperAdmin, authController.addAdmin);
router.delete('/admins/:id', verifyToken, requireSuperAdmin, authController.deleteAdmin);
router.put('/admins/:id/reset-password', verifyToken, requireSuperAdmin, authController.resetPassword);

module.exports = router;
