const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');
const Subject = require('./models/Subject');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: "Learning Progress Monitor API v2.0",
        status: "OK",
        database: "MongoDB Connected"
    });
});

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new student
app.post('/api/students', async (req, res) => {
    try {
        const { studentId, name, class: studentClass, department } = req.body;
        
        // Generate student ID if not provided
        const finalStudentId = studentId || `STU${Date.now()}`;
        
        const student = new Student({
            studentId: finalStudentId,
            name,
            class: studentClass,
            department
        });
        
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Subjects routes
app.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ name: 1 });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/subjects', async (req, res) => {
    try {
        const { code, name } = req.body;
        
        const subject = new Subject({
            code: code.toUpperCase(),
            name
        });
        
        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Test route with sample data
app.get('/api/test-data', async (req, res) => {
    try {
        // Clear existing test data
        await Student.deleteMany({});
        await Subject.deleteMany({});
        
        // Add sample students
        const sampleStudents = [
            { studentId: 'STU001', name: 'John Doe', class: '10', department: 'Science' },
            { studentId: 'STU002', name: 'Jane Smith', class: '11', department: 'Commerce' },
            { studentId: 'STU003', name: 'Bob Johnson', class: '12', department: 'Arts' }
        ];
        
        const students = await Student.insertMany(sampleStudents);
        
        // Add sample subjects
        const sampleSubjects = [
            { code: 'MATH101', name: 'Mathematics' },
            { code: 'SCI101', name: 'Science' },
            { code: 'ENG101', name: 'English' },
            { code: 'HIST101', name: 'History' }
        ];
        
        const subjects = await Subject.insertMany(sampleSubjects);
        
        res.json({
            message: 'Sample data added successfully',
            students: students.length,
            subjects: subjects.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});