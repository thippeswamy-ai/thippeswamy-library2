const fs = require('fs');
const path = require('path');
const BookRequest = require('../models/BookRequest');
const { getMongoStatus, DATA_DIR } = require('../config/db');

const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

function readRequestsFromFile() {
  if (!fs.existsSync(REQUESTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeRequestsToFile(requests) {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
}

exports.createRequest = async (req, res) => {
  try {
    const { studentDetails, bookDetails } = req.body;
    if (!studentDetails || !studentDetails.fullName || !studentDetails.rollNumber || !bookDetails || !bookDetails.title) {
      return res.status(400).json({ message: 'Missing required student or book details.' });
    }

    const reqData = {
      studentDetails,
      bookDetails,
      status: 'Pending',
      adminComments: '',
      notified: false,
      createdAt: new Date().toISOString()
    };

    if (getMongoStatus()) {
      const newReq = new BookRequest(reqData);
      await newReq.save();
      return res.status(201).json({ message: 'Your book request has been submitted successfully.', request: newReq });
    } else {
      const requests = readRequestsFromFile();
      reqData._id = 'req_' + Date.now();
      requests.unshift(reqData);
      writeRequestsToFile(requests);
      return res.status(201).json({ message: 'Your book request has been submitted successfully.', request: reqData });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit request', error: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    if (getMongoStatus()) {
      let query = {};
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { 'studentDetails.fullName': { $regex: search, $options: 'i' } },
          { 'studentDetails.rollNumber': { $regex: search, $options: 'i' } },
          { 'studentDetails.department': { $regex: search, $options: 'i' } },
          { 'bookDetails.title': { $regex: search, $options: 'i' } }
        ];
      }
      const requests = await BookRequest.find(query).sort({ createdAt: -1 });
      return res.json(requests);
    } else {
      let requests = readRequestsFromFile();
      if (status && status !== 'All') {
        requests = requests.filter(r => r.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        requests = requests.filter(r => 
          (r.studentDetails.fullName && r.studentDetails.fullName.toLowerCase().includes(s)) ||
          (r.studentDetails.rollNumber && r.studentDetails.rollNumber.toLowerCase().includes(s)) ||
          (r.studentDetails.department && r.studentDetails.department.toLowerCase().includes(s)) ||
          (r.bookDetails.title && r.bookDetails.title.toLowerCase().includes(s))
        );
      }
      return res.json(requests);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving book requests' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComments, notifyStudent } = req.body;

    if (getMongoStatus()) {
      const update = { status };
      if (adminComments !== undefined) update.adminComments = adminComments;
      if (notifyStudent) update.notified = true;

      const updatedReq = await BookRequest.findByIdAndUpdate(id, update, { new: true });
      if (!updatedReq) return res.status(404).json({ message: 'Request not found' });
      return res.json({ message: `Request status updated to ${status}`, request: updatedReq });
    } else {
      let requests = readRequestsFromFile();
      const idx = requests.findIndex(r => r._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Request not found' });

      requests[idx].status = status;
      if (adminComments !== undefined) requests[idx].adminComments = adminComments;
      if (notifyStudent) requests[idx].notified = true;

      writeRequestsToFile(requests);
      return res.json({ message: `Request status updated to ${status}`, request: requests[idx] });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update request status' });
  }
};

exports.getRequestStats = async (req, res) => {
  try {
    let requests = [];
    if (getMongoStatus()) {
      requests = await BookRequest.find();
    } else {
      requests = readRequestsFromFile();
    }

    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'Pending').length,
      approvedRequests: requests.filter(r => r.status === 'Approved').length,
      completedRequests: requests.filter(r => r.status === 'Available').length
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ totalRequests: 0, pendingRequests: 0, approvedRequests: 0, completedRequests: 0 });
  }
};
