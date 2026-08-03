const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Simple embedded JSON file database fallback if MongoDB isn't running locally
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/arts_college_library';
  try {
    // Attempt MongoDB connection with 3 sec timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log('MongoDB Connected Successfully.');
  } catch (err) {
    console.log('MongoDB connection skipped/failed. Using embedded JSON data engine.');
    isMongoConnected = false;
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = { connectDB, getMongoStatus, DATA_DIR };
