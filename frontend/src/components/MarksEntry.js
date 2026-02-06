import React, { useState, useEffect } from 'react';
import './MarksEntry.css';

function MarksEntry({ students, subjects, onMarkAdded }) {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [marksData, setMarksData] = useState([]);
    const [studentMarks, setStudentMarks] = useState({});
    const [loading, setLoading] = useState(false);
    const [studentProgress, setStudentProgress] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);

    // Load marks when student is selected
    useEffect(() => {
        if (selectedStudent) {
            loadStudentMarks(selectedStudent);
        }
    }, [selectedStudent]);

    const loadStudentMarks = async (studentId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/marks/student/${studentId}`);
            const data = await response.json();
            
            // Create marks object for easy access
            const marksObj = {};
            data.marks.forEach(mark => {
                marksObj[mark.subjectId._id] = mark.marks;
            });
            
            setStudentMarks(marksObj);
            setStudentProgress(data.progress);
            setStudentInfo(data.student);
            setMarksData(data.marks);
        } catch (error) {
            console.error('Error loading marks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (subjectId, marks) => {
        // Validate marks (0-100)
        const validMarks = Math.min(Math.max(parseInt(marks) || 0, 0), 100);
        setStudentMarks(prev => ({
            ...prev,
            [subjectId]: validMarks
        }));
    };

    const saveMarks = async () => {
        if (!selectedStudent) {
            alert('Please select a student first');
            return;
        }

        // Check if at least one mark is entered
        const hasMarks = Object.values(studentMarks).some(mark => mark !== undefined && mark !== '');
        if (!hasMarks) {
            alert('Please enter at least one mark');
            return;
        }

        setLoading(true);
        try {
            const savePromises = Object.entries(studentMarks)
                .filter(([_, marks]) => marks !== undefined && marks !== '')
                .map(([subjectId, marks]) => 
                    fetch('http://localhost:5000/api/marks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: selectedStudent,
                            subjectId,
                            marks: parseInt(marks)
                        })
                    })
                );

            await Promise.all(savePromises);
            alert('✅ Marks saved successfully!');
            loadStudentMarks(selectedStudent);
            if (onMarkAdded) onMarkAdded();
        } catch (error) {
            alert('❌ Error saving marks: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearMarks = () => {
        setStudentMarks({});
        if (selectedStudent) {
            loadStudentMarks(selectedStudent);
        }
    };

    const getGradeColor = (grade) => {
        const gradeColors = {
            'A+': '#28a745',
            'A': '#28a745',
            'B+': '#20c997',
            'B': '#20c997',
            'C': '#ffc107',
            'D': '#fd7e14',
            'F': '#dc3545',
            'N/A': '#6c757d'
        };
        return gradeColors[grade] || '#6c757d';
    };

    const getStatusColor = (status) => {
        return status === 'Pass' ? '#28a745' : 
               status === 'Fail' ? '#dc3545' : '#6c757d';
    };

    return (
        <div className="marks-entry">
            <h2>📝 Marks Entry System</h2>
            
            {/* Student Selection */}
            <div className="student-selection">
                <label>Select Student:</label>
                <select 
                    value={selectedStudent} 
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    disabled={loading}
                >
                    <option value="">-- Choose Student --</option>
                    {students.map(student => (
                        <option key={student._id} value={student._id}>
                            {student.name} ({student.studentId}) - Class {student.class}
                        </option>
                    ))}
                </select>
            </div>

            {/* Student Info & Progress Display */}
            {studentInfo && studentProgress && (
                <div className="student-info-card">
                    <div className="student-header">
                        <h3>Student Information</h3>
                        <div className="student-details">
                            <span><strong>Name:</strong> {studentInfo.name}</span>
                            <span><strong>ID:</strong> {studentInfo.studentId}</span>
                            <span><strong>Class:</strong> {studentInfo.class}</span>
                            <span><strong>Department:</strong> {studentInfo.department}</span>
                        </div>
                    </div>
                    
                    <div className="progress-summary">
                        <h3>📊 Progress Summary</h3>
                        <div className="progress-cards">
                            <div className="progress-card">
                                <span className="label">Total Marks</span>
                                <span className="value">{studentProgress.totalMarks}</span>
                            </div>
                            <div className="progress-card">
                                <span className="label">Average</span>
                                <span className="value">{studentProgress.average}</span>
                            </div>
                            <div className="progress-card">
                                <span className="label">Grade</span>
                                <span 
                                    className="value grade" 
                                    style={{ color: getGradeColor(studentProgress.grade) }}
                                >
                                    {studentProgress.grade}
                                </span>
                            </div>
                            <div className="progress-card">
                                <span className="label">Status</span>
                                <span 
                                    className="value status" 
                                    style={{ 
                                        color: getStatusColor(studentProgress.status),
                                        backgroundColor: studentProgress.status === 'Pass' ? '#d4edda' : '#f8d7da'
                                    }}
                                >
                                    {studentProgress.status}
                                </span>
                            </div>
                        </div>
                        <div className="progress-remark">
                            <strong>📝 Remark:</strong> {studentProgress.progressRemark}
                        </div>
                    </div>
                </div>
            )}

            {/* Marks Entry Form */}
            {selectedStudent && subjects.length > 0 && (
                <div className="marks-form">
                    <div className="form-header">
                        <h3>Enter Subject Marks (0-100)</h3>
                        <button 
                            className="clear-btn"
                            onClick={clearMarks}
                            disabled={loading}
                        >
                            🗑️ Clear All
                        </button>
                    </div>
                    
                    <div className="marks-grid">
                        {subjects.map(subject => (
                            <div key={subject._id} className="mark-input-group">
                                <label htmlFor={`mark-${subject._id}`}>
                                    {subject.name} ({subject.code})
                                </label>
                                <div className="input-with-grade">
                                    <input
                                        id={`mark-${subject._id}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={studentMarks[subject._id] || ''}
                                        onChange={(e) => handleMarkChange(subject._id, e.target.value)}
                                        placeholder="Enter marks"
                                        disabled={loading}
                                    />
                                    {studentMarks[subject._id] !== undefined && studentMarks[subject._id] !== '' && (
                                        <span className="grade-indicator" style={{
                                            backgroundColor: getGradeColor(
                                                studentMarks[subject._id] >= 90 ? 'A+' :
                                                studentMarks[subject._id] >= 80 ? 'A' :
                                                studentMarks[subject._id] >= 70 ? 'B+' :
                                                studentMarks[subject._id] >= 60 ? 'B' :
                                                studentMarks[subject._id] >= 50 ? 'C' :
                                                studentMarks[subject._id] >= 40 ? 'D' : 'F'
                                            )
                                        }}>
                                            {studentMarks[subject._id] >= 90 ? 'A+' :
                                             studentMarks[subject._id] >= 80 ? 'A' :
                                             studentMarks[subject._id] >= 70 ? 'B+' :
                                             studentMarks[subject._id] >= 60 ? 'B' :
                                             studentMarks[subject._id] >= 50 ? 'C' :
                                             studentMarks[subject._id] >= 40 ? 'D' : 'F'}
                                        </span>
                                    )}
                                </div>
                                <div className="mark-status">
                                    {studentMarks[subject._id] !== undefined && studentMarks[subject._id] !== '' && (
                                        <span className={
                                            studentMarks[subject._id] >= 40 ? 'pass' : 'fail'
                                        }>
                                            {studentMarks[subject._id] >= 40 ? '✅ Pass' : '❌ Fail'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            className="save-marks-btn" 
                            onClick={saveMarks}
                            disabled={loading || !selectedStudent}
                        >
                            {loading ? '⏳ Saving...' : '💾 Save All Marks'}
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Marks Table */}
            {marksData.length > 0 && (
                <div className="existing-marks">
                    <h3>📋 Existing Marks Record</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Code</th>
                                <th>Marks</th>
                                <th>Grade</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marksData.map(mark => (
                                <tr key={mark._id}>
                                    <td>{mark.subjectId.name}</td>
                                    <td>{mark.subjectId.code}</td>
                                    <td>{mark.marks}</td>
                                    <td className={
                                        mark.marks >= 90 ? 'grade-a' :
                                        mark.marks >= 80 ? 'grade-a' :
                                        mark.marks >= 70 ? 'grade-b' :
                                        mark.marks >= 60 ? 'grade-b' :
                                        mark.marks >= 50 ? 'grade-c' :
                                        mark.marks >= 40 ? 'grade-d' : 'grade-f'
                                    }>
                                        {mark.marks >= 90 ? 'A+' :
                                         mark.marks >= 80 ? 'A' :
                                         mark.marks >= 70 ? 'B+' :
                                         mark.marks >= 60 ? 'B' :
                                         mark.marks >= 50 ? 'C' :
                                         mark.marks >= 40 ? 'D' : 'F'}
                                    </td>
                                    <td className={mark.marks >= 40 ? 'pass' : 'fail'}>
                                        {mark.marks >= 40 ? 'Pass' : 'Fail'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading data...</p>
                </div>
            )}
        </div>
    );
}

export default MarksEntry;