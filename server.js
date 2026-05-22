const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Path to data file
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ complaints: [] }, null, 2));
}

// Helper functions
function readData() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `FTNT-${timestamp}-${random}`;
}

// ========== API ROUTES ==========

// Get all complaints
app.get('/api/complaints', (req, res) => {
    const data = readData();
    res.json({ success: true, complaints: data.complaints });
});

// Get single complaint by ID
app.get('/api/complaints/:id', (req, res) => {
    const data = readData();
    const complaint = data.complaints.find(c => c.id === req.params.id);
    res.json({ success: true, complaint: complaint || null });
});

// Submit new complaint
app.post('/api/complaints', (req, res) => {
    const data = readData();
    
    const newComplaint = {
        id: generateId(),
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        category: req.body.category,
        message: req.body.message,
        status: "Pending",
        reply: "",
        replyDate: "",
        createdAt: new Date().toLocaleString()
    };
    
    data.complaints.unshift(newComplaint);
    writeData(data);
    
    res.json({ success: true, id: newComplaint.id });
});

// Add reply to complaint
app.put('/api/complaints/:id/reply', (req, res) => {
    const data = readData();
    const complaint = data.complaints.find(c => c.id === req.params.id);
    
    if (complaint) {
        complaint.reply = req.body.reply;
        complaint.replyDate = new Date().toLocaleString();
        complaint.status = "Replied";
        writeData(data);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: "Complaint not found" });
    }
});

// Mark complaint as resolved
app.put('/api/complaints/:id/resolve', (req, res) => {
    const data = readData();
    const complaint = data.complaints.find(c => c.id === req.params.id);
    
    if (complaint) {
        complaint.status = "Resolved";
        writeData(data);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: "Complaint not found" });
    }
});

// Delete complaint
app.delete('/api/complaints/:id', (req, res) => {
    const data = readData();
    data.complaints = data.complaints.filter(c => c.id !== req.params.id);
    writeData(data);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Customer page: http://localhost:${PORT}`);
    console.log(`🔒 Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`💾 Data stored in: ${DATA_FILE}`);
});
