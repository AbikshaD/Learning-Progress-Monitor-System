import React, { useState, useEffect } from 'react';
import './MarksEntry.css';

function MarksEntry({ students, subjects, onMarkAdded }) {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [marksData, setMarksData] = useState([]);
    const [studentMarks, setStudentMarks] = useState({});
    const [loading, setLoading] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);
    const [semesterSubjects, setSemesterSubjects] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentInfo(selectedStudent);
            const student = students.find(s => s._id === selectedStudent);
            if (student) {
                // Generate semesters up to current semester
                const semesters = Array.from({ length: student.semester }, (_, i) => i + 1);
                setAvailableSemesters(semesters);
                if (semesters.length > 0 && !selectedSemester) {
                    setSelectedSemester(semesters[0]);
                }
            }
        }
    }, [selectedStudent]);

    useEffect(() => {
        if (selectedStudent && selectedSemester) {
            loadStudentMarks(selectedStudent, selectedSemester);
            loadSemesterSubjects(selectedSemester);
        }
    }, [selectedStudent, selectedSemester]);

    const loadStudentInfo = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/students/${studentId}`);
            const data = await response.json();
            setStudentInfo(data.student);
        } catch (error) {
            console.error('Error loading student info:', error);
        }
    };

    const loadSemesterSubjects = async (semester) => {
        try {
            const response = await fetch(`http://localhost:5000/api/subjects/semester/${semester}`);
            const data = await response.json();
            setSemesterSubjects(data);
            
            // Initialize marks object
            const marksObj = {};
            data.forEach(subject => {
                marksObj[subject._id] = {
                    theory: '',
                    practical: '',
                    internal: '',
                    attendance: ''
                };
            });
            setStudentMarks(marksObj);
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    };

    const loadStudentMarks = async (studentId, semester) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/marks/student/${studentId}/semester/${semester}`);
            const data = await response.json();
            
            const marksObj = {};
            data.forEach(mark => {
                marksObj[mark.subjectId] = {
                    theory: mark.marks.theory || '',
                    practical: mark.marks.practical || '',
                    internal: mark.marks.internal || '',
                    attendance: mark.marks.attendance || ''
                };
            });
            
            setStudentMarks(marksObj);
            setMarksData(data);
        } catch (error) {
            console.error('Error loading marks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (subjectId, type, value) => {
        // Validate marks based on type
        let validValue = parseInt(value) || '';
        
        if (validValue !== '') {
            const maxValues = {
                theory: 100,
                practical: 100,
                internal: 50,
                attendance: 10
            };
            validValue = Math.min(Math.max(validValue, 0), maxValues[type]);
        }
        
        setStudentMarks(prev => ({
            ...prev,
            [subjectId]: {
                ...prev[subjectId],
                [type]: validValue
            }
        }));
    };

    const calculateTotalMarks = (marks) => {
        if (!marks) return 0;
        
        const theory = parseInt(marks.theory) || 0;
        const practical = parseInt(marks.practical) || 0;
        const internal = parseInt(marks.internal) || 0;
        const attendance = parseInt(marks.attendance) || 0;
        
        // Adjust based on subject type
        if (practical > 0) {
            // Lab subject: theory + practical + internal
            return theory + practical + internal;
        } else {
            // Theory subject: theory + internal + attendance
            return theory + internal + attendance;
        }
    };

    const calculateGrade = (totalMarks) => {
        if (totalMarks >= 90) return { grade: 'S', points: 10 };
        if (totalMarks >= 80) return { grade: 'A', points: 9 };
        if (totalMarks >= 70) return { grade: 'B', points: 8 };
        if (totalMarks >= 60) return { grade: 'C', points: 7 };
        if (totalMarks >= 55) return { grade: 'D', points: 6 };
        if (totalMarks >= 50) return { grade: 'E', points: 5 };
        return { grade: 'F', points: 0 };
    };

    const saveMarks = async () => {
        if (!selectedStudent || !selectedSemester) {
            alert('Please select a student and semester');
            return;
        }

        setLoading(true);
        try {
            const savePromises = Object.entries(studentMarks)
                .filter(([subjectId, marks]) => {
                    // Save if at least one mark is entered
                    return marks.theory !== '' || marks.practical !== '' || 
                           marks.internal !== '' || marks.attendance !== '';
                })
                .map(([subjectId, marks]) => {
                    const totalMarks = calculateTotalMarks(marks);
                    const gradeData = calculateGrade(totalMarks);
                    
                    return fetch('http://localhost:5000/api/marks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: selectedStudent,
                            subjectId,
                            semester: parseInt(selectedSemester),
                            marks: marks,
                            totalMarks: totalMarks,
                            grade: gradeData.grade,
                            gradePoints: gradeData.points,
                            creditsEarned: gradeData.grade !== 'F' ? 
                                semesterSubjects.find(s => s._id === subjectId)?.credits || 0 : 0,
                            result: totalMarks >= 40 ? 'Pass' : 'Fail'
                        })
                    });
                });

            await Promise.all(savePromises);
            alert('✅ Marks saved successfully!');
            loadStudentMarks(selectedStudent, selectedSemester);
            if (onMarkAdded) onMarkAdded();
        } catch (error) {
            alert('❌ Error saving marks: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        const gradeColors = {
            'S': '#28a745',
            'A': '#28a745',
            'B': '#20c997',
            'C': '#ffc107',
            'D': '#fd7e14',
            'E': '#dc3545',
            'F': '#dc3545',
            'N/A': '#6c757d'
        };
        return gradeColors[grade] || '#6c757d';
    };

    return (
        <div className="marks-entry">
            <h2>📝 Engineering Marks Entry System</h2>
            
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
                            {student.name} ({student.studentId}) - {student.department} - Sem {student.semester}
                        </option>
                    ))}
                </select>
            </div>

            {/* Semester Selection */}
            {selectedStudent && (
                <div className="semester-selection">
                    <label>Select Semester:</label>
                    <div className="semester-buttons">
                        {availableSemesters.map(sem => (
                            <button
                                key={sem}
                                type="button"
                                className={selectedSemester === sem.toString() ? 'active' : ''}
                                onClick={() => setSelectedSemester(sem.toString())}
                            >
                                Sem {sem}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Info */}
            {studentInfo && (
                <div className="student-info-card">
                    <div className="student-header">
                        <h3>Student Information</h3>
                        <div className="student-details">
                            <span><strong>Name:</strong> {studentInfo.name}</span>
                            <span><strong>ID:</strong> {studentInfo.studentId}</span>
                            <span><strong>Department:</strong> {studentInfo.department}</span>
                            <span><strong>Semester:</strong> {studentInfo.semester}</span>
                            <span><strong>Academic Year:</strong> {studentInfo.academicYear}</span>
                            <span><strong>CGPA:</strong> {studentInfo.cgpa}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Marks Entry Form */}
            {selectedStudent && selectedSemester && semesterSubjects.length > 0 && (
                <div className="marks-form">
                    <div className="form-header">
                        <h3>Enter Marks for Semester {selectedSemester}</h3>
                        <button 
                            className="clear-btn"
                            onClick={() => setStudentMarks({})}
                            disabled={loading}
                        >
                            🗑️ Clear All
                        </button>
                    </div>
                    
                    <div className="subjects-grid">
                        {semesterSubjects.map(subject => (
                            <div key={subject._id} className="subject-card">
                                <div className="subject-header">
                                    <h4>{subject.name}</h4>
                                    <span className="subject-code">{subject.subjectCode}</span>
                                    <span className="subject-credits">{subject.credits} Credits</span>
                                    <span className="subject-type">{subject.type}</span>
                                </div>
                                
                                <div className="marks-inputs">
                                    {subject.type !== 'Lab' && (
                                        <div className="input-group">
                                            <label>Theory (0-100)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={studentMarks[subject._id]?.theory || ''}
                                                onChange={(e) => handleMarkChange(subject._id, 'theory', e.target.value)}
                                                placeholder="Theory marks"
                                                disabled={loading}
                                            />
                                        </div>
                                    )}
                                    
                                    {subject.type === 'Lab' && (
                                        <div className="input-group">
                                            <label>Practical (0-100)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={studentMarks[subject._id]?.practical || ''}
                                                onChange={(e) => handleMarkChange(subject._id, 'practical', e.target.value)}
                                                placeholder="Practical marks"
                                                disabled={loading}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="input-group">
                                        <label>Internal (0-50)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={studentMarks[subject._id]?.internal || ''}
                                            onChange={(e) => handleMarkChange(subject._id, 'internal', e.target.value)}
                                            placeholder="Internal marks"
                                            disabled={loading}
                                        />
                                    </div>
                                    
                                    {subject.type !== 'Lab' && (
                                        <div className="input-group">
                                            <label>Attendance (0-10)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={studentMarks[subject._id]?.attendance || ''}
                                                onChange={(e) => handleMarkChange(subject._id, 'attendance', e.target.value)}
                                                placeholder="Attendance"
                                                disabled={loading}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Calculated Total & Grade */}
                                {studentMarks[subject._id] && (
                                    <div className="calculated-results">
                                        <div className="total-marks">
                                            <span>Total:</span>
                                            <strong>{calculateTotalMarks(studentMarks[subject._id])}</strong>
                                        </div>
                                        <div className="grade-display">
                                            <span>Grade:</span>
                                            <strong style={{ 
                                                color: getGradeColor(calculateGrade(calculateTotalMarks(studentMarks[subject._id])).grade)
                                            }}>
                                                {calculateGrade(calculateTotalMarks(studentMarks[subject._id])).grade}
                                            </strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            className="save-marks-btn" 
                            onClick={saveMarks}
                            disabled={loading}
                        >
                            {loading ? '⏳ Saving...' : '💾 Save All Marks'}
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Marks Table */}
            {marksData.length > 0 && (
                <div className="existing-marks">
                    <h3>📋 Existing Marks Record - Semester {selectedSemester}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Code</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>Points</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marksData.map(mark => (
                                <tr key={mark._id}>
                                    <td>{mark.subjectId.name}</td>
                                    <td>{mark.subjectId.subjectCode}</td>
                                    <td>{mark.totalMarks}</td>
                                    <td style={{ 
                                        color: getGradeColor(mark.grade),
                                        fontWeight: 'bold'
                                    }}>
                                        {mark.grade}
                                    </td>
                                    <td>{mark.gradePoints}</td>
                                    <td className={mark.result === 'Pass' ? 'pass' : 'fail'}>
                                        {mark.result}
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