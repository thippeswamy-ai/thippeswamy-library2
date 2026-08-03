const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const { getMongoStatus, DATA_DIR } = require('../config/db');

const BOOKS_FILE = path.join(DATA_DIR, 'books.json');

// Memory DB Helper
function readBooksFromFile() {
  if (!fs.existsSync(BOOKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeBooksToFile(books) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf8');
}

// Initial seed books if empty
const sampleBooks = [
  {
    _id: "book_1",
    title: "Indian Polity for Civil Services",
    author: "M. Laxmikanth",
    category: "Competitive Books",
    price: 650,
    description: "Essential reference book for UPSC and APPSC competitive examinations covering constitutional framework.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    availability: "Available",
    location: { floor: "First Floor", section: "Competitive Exam Wing", rack: "R-04", shelf: "S-2", row: "Row-1" },
    createdAt: new Date().toISOString()
  },
  {
    _id: "book_2",
    title: "Quantitative Aptitude for Competitive Examinations",
    author: "R.S. Aggarwal",
    category: "Competitive Books",
    price: 520,
    description: "Comprehensive study material for bank PO, SSC, campus recruitment and state entrance exams.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
    availability: "Available",
    location: { floor: "First Floor", section: "Competitive Exam Wing", rack: "R-02", shelf: "S-1", row: "Row-3" },
    createdAt: new Date().toISOString()
  },
  {
    _id: "book_3",
    title: "Data Structures and Algorithms in JavaScript",
    author: "Michael T. Goodrich",
    category: "Technology",
    price: 780,
    description: "In-depth guide to modern algorithms, linear structures, trees, dynamic programming and complexity analysis.",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    availability: "Available",
    location: { floor: "Second Floor", section: "Computer Science Dept", rack: "R-12", shelf: "S-4", row: "Row-2" },
    createdAt: new Date().toISOString()
  },
  {
    _id: "book_4",
    title: "Wings of Fire: An Autobiography",
    author: "A.P.J. Abdul Kalam",
    category: "Biography",
    price: 350,
    description: "Inspiring autobiography of India's former president and renowned scientist Dr. APJ Abdul Kalam.",
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    availability: "Issued",
    location: { floor: "Ground Floor", section: "Biographies & Memoirs", rack: "R-01", shelf: "S-3", row: "Row-1" },
    createdAt: new Date().toISOString()
  },
  {
    _id: "book_5",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    price: 490,
    description: "Landmark book in science writing exploring cosmology, black holes, time travel and big bang theory.",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80",
    availability: "Available",
    location: { floor: "Second Floor", section: "Physics & Astronomy", rack: "R-08", shelf: "S-2", row: "Row-4" },
    createdAt: new Date().toISOString()
  },
  {
    _id: "book_6",
    title: "General Knowledge 2026",
    author: "Manohar Pandey",
    category: "General Knowledge",
    price: 290,
    description: "Updated facts on history, geography, Indian polity, economy and current affairs updates.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    availability: "Available",
    location: { floor: "Ground Floor", section: "Reference Desk", rack: "R-03", shelf: "S-1", row: "Row-1" },
    createdAt: new Date().toISOString()
  },
  {
    _id: "book_7",
    title: "The Discovery of India",
    author: "Jawaharlal Nehru",
    category: "History",
    price: 600,
    description: "Written during imprisonment at Ahmednagar fort, capturing Indian history from Indus Valley to British rule.",
    coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
    availability: "Available",
    location: { floor: "First Floor", section: "Indian History", rack: "R-06", shelf: "S-3", row: "Row-2" },
    createdAt: new Date().toISOString()
  },
  {
    _id: "book_8",
    title: "Malgudi Days",
    author: "R.K. Narayan",
    category: "Stories",
    price: 250,
    description: "Charming short story collection set in the fictional South Indian town of Malgudi.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    availability: "Available",
    location: { floor: "Ground Floor", section: "Fiction & Literature", rack: "R-05", shelf: "S-2", row: "Row-1" },
    createdAt: new Date().toISOString()
  }
];

// Initialize sample data if file doesn't exist
if (!fs.existsSync(BOOKS_FILE)) {
  writeBooksToFile(sampleBooks);
}

exports.getAllBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    if (getMongoStatus()) {
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      const books = await Book.find(query).sort({ createdAt: -1 });
      return res.json(books);
    } else {
      let books = readBooksFromFile();
      if (category && category !== 'All') {
        books = books.filter(b => b.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const s = search.toLowerCase();
        books = books.filter(b => 
          b.title.toLowerCase().includes(s) || 
          b.author.toLowerCase().includes(s) ||
          b.category.toLowerCase().includes(s)
        );
      }
      return res.json(books);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving books', error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      return res.json(book);
    } else {
      const books = readBooksFromFile();
      const book = books.find(b => b._id === req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      return res.json(book);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching book detail' });
  }
};

exports.addBook = async (req, res) => {
  try {
    const { title, author, category, price, description, coverImage, availability, location } = req.body;
    let imagePath = coverImage || '/assets/default-cover.jpg';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newBookData = {
      title,
      author,
      category,
      price: Number(price) || 0,
      description: description || '',
      coverImage: imagePath,
      availability: availability || 'Available',
      location: typeof location === 'string' ? JSON.parse(location) : (location || {
        floor: req.body.floor || 'Ground Floor',
        section: req.body.section || 'General',
        rack: req.body.rack || 'R-01',
        shelf: req.body.shelf || 'S-1',
        row: req.body.row || 'Row-1'
      })
    };

    if (getMongoStatus()) {
      const book = new Book(newBookData);
      await book.save();
      return res.status(201).json({ message: 'Book added successfully', book });
    } else {
      const books = readBooksFromFile();
      newBookData._id = 'book_' + Date.now();
      newBookData.createdAt = new Date().toISOString();
      books.unshift(newBookData);
      writeBooksToFile(books);
      return res.status(201).json({ message: 'Book added successfully', book: newBookData });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to add book', error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }
    if (typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    } else if (req.body.floor) {
      updateData.location = {
        floor: req.body.floor,
        section: req.body.section,
        rack: req.body.rack,
        shelf: req.body.shelf,
        row: req.body.row
      };
    }

    if (getMongoStatus()) {
      const book = await Book.findByIdAndUpdate(id, updateData, { new: true });
      if (!book) return res.status(404).json({ message: 'Book not found' });
      return res.json({ message: 'Book updated successfully', book });
    } else {
      let books = readBooksFromFile();
      const idx = books.findIndex(b => b._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Book not found' });
      books[idx] = { ...books[idx], ...updateData };
      writeBooksToFile(books);
      return res.json({ message: 'Book updated successfully', book: books[idx] });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update book', error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (getMongoStatus()) {
      await Book.findByIdAndDelete(id);
      return res.json({ message: 'Book deleted successfully' });
    } else {
      let books = readBooksFromFile();
      books = books.filter(b => b._id !== id);
      writeBooksToFile(books);
      return res.json({ message: 'Book deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete book' });
  }
};

exports.getStats = async (req, res) => {
  try {
    let totalCount = 0;
    if (getMongoStatus()) {
      totalCount = await Book.countDocuments();
    } else {
      const books = readBooksFromFile();
      totalCount = books.length;
    }
    res.json({ totalBooks: totalCount });
  } catch (err) {
    res.status(500).json({ totalBooks: 0 });
  }
};
