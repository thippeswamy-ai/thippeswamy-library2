const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bookController = require('../controllers/bookController');
const { verifyToken } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cover-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Public Routes
router.get('/', bookController.getAllBooks);
router.get('/stats', bookController.getStats);
router.get('/:id', bookController.getBookById);

// Protected Admin Routes
router.post('/', verifyToken, upload.single('coverImageFile'), bookController.addBook);
router.put('/:id', verifyToken, upload.single('coverImageFile'), bookController.updateBook);
router.delete('/:id', verifyToken, bookController.deleteBook);

module.exports = router;
