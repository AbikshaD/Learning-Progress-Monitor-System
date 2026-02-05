// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (we'll replace with MongoDB later)
let students = [
    { id: 1, name: "John Doe", class: "10", department: "Science" },
    { id: 2, name: "Jane Smith", class: "11", department: "Commerce" }
];

let subjects = [
    { id: 1, code: "MATH101", name: "Mathematics" },
    { id: 2, code: "SCI101", name: "Science" }
];

// Basic routes
app.get('/api/students', (req, res) => {
    res.json(students);
});

app.post('/api/students', (req, res) => {
    const newStudent = {
        id: students.length + 1,
        ...req.body
    };
    students.push(newStudent);
    res.status(201).json(newStudent);
});

app.get('/api/subjects', (req, res) => {
    res.json(subjects);
});

app.get('/', (req, res) => {
    res.json({ message: "Learning Progress Monitor API is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});