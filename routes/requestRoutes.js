const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');

// Public Route for Students
router.post('/', requestController.createRequest);

// Protected Admin Routes
router.get('/', verifyToken, requestController.getAllRequests);
router.get('/stats', verifyToken, requestController.getRequestStats);
router.put('/:id/status', verifyToken, requestController.updateRequestStatus);

module.exports = router;
