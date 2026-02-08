import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
    const [activeReport, setActiveReport] = useState('student');
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [semesters, setSemesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/students?limit=1000');
            const data = await response.json();
            setStudents(data.students || data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/students/filters/options');
            const data = await response.json();
            setDepartments(data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const generateStudentReport = async () => {
        if (!selectedStudent) {
            alert('Please select a student');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/reports/student/${selectedStudent}/academic`);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            alert('Error generating report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateDepartmentReport = async () => {
        if (!selectedDepartment) {
            alert('Please select a department');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/reports/department/${selectedDepartment}/performance`);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            alert('Error generating report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateSemesterReport = async () => {
        if (!selectedDepartment || !selectedSemester) {
            alert('Please select department and semester');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/reports/department/${selectedDepartment}/semester/${selectedSemester}`);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            alert('Error generating report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateCGPAReport = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/reports/cgpa-analysis');
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            alert('Error generating report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = async () => {
        if (!reportData) {
            alert('No report data to export');
            return;
        }

        // CSV generation logic here
        alert('Export feature will be implemented');
    };

    const printReport = () => {
        window.print();
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

    const getCGPAColor = (cgpa) => {
        if (cgpa >= 9) return '#28a745';
        if (cgpa >= 8) return '#20c997';
        if (cgpa >= 7) return '#ffc107';
        if (cgpa >= 6) return '#fd7e14';
        if (cgpa >= 5) return '#dc3545';
        return '#6c757d';
    };

    return (
        <div className="reports-container">
            <h2>📊 Engineering College Reports</h2>
            
            {/* Report Type Selection */}
            <div className="report-type-selector">
                <button 
                    className={activeReport === 'student' ? 'active' : ''}
                    onClick={() => setActiveReport('student')}
                >
                    👤 Student Academic Report
                </button>
                <button 
                    className={activeReport === 'department' ? 'active' : ''}
                    onClick={() => setActiveReport('department')}
                >
                    🏢 Department Performance
                </button>
                <button 
                    className={activeReport === 'semester' ? 'active' : ''}
                    onClick={() => setActiveReport('semester')}
                >
                    📚 Semester Analysis
                </button>
                <button 
                    className={activeReport === 'cgpa' ? 'active' : ''}
                    onClick={() => setActiveReport('cgpa')}
                >
                    🏆 CGPA Analysis
                </button>
            </div>

            {/* Report Parameters */}
            <div className="report-params">
                {activeReport === 'student' && (
                    <div className="param-group">
                        <label>Select Student:</label>
                        <select 
                            value={selectedStudent} 
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">-- Choose Student --</option>
                            {students.map(student => (
                                <option key={student._id} value={student._id}>
                                    {student.name} ({student.studentId}) - {student.department}
                                </option>
                            ))}
                        </select>
                        <button 
                            onClick={generateStudentReport}
                            disabled={loading || !selectedStudent}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                )}

                {activeReport === 'department' && (
                    <div className="param-group">
                        <label>Select Department:</label>
                        <select 
                            value={selectedDepartment} 
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">-- Choose Department --</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <button 
                            onClick={generateDepartmentReport}
                            disabled={loading || !selectedDepartment}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                )}

                {activeReport === 'semester' && (
                    <div className="param-group">
                        <div className="dual-select">
                            <div>
                                <label>Department:</label>
                                <select 
                                    value={selectedDepartment} 
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">-- Choose Department --</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Semester:</label>
                                <select 
                                    value={selectedSemester} 
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">-- Choose Semester --</option>
                                    {semesters.map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={generateSemesterReport}
                            disabled={loading || !selectedDepartment || !selectedSemester}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                )}

                {activeReport === 'cgpa' && (
                    <div className="param-group">
                        <button 
                            onClick={generateCGPAReport}
                            disabled={loading}
                            className="institution-btn"
                        >
                            {loading ? 'Generating...' : 'Generate CGPA Analysis'}
                        </button>
                    </div>
                )}
            </div>

            {/* Report Actions */}
            {reportData && (
                <div className="report-actions">
                    <button onClick={exportToCSV} disabled={loading}>
                        📥 Export as CSV
                    </button>
                    <button onClick={printReport} disabled={loading}>
                        🖨️ Print Report
                    </button>
                </div>
            )}

            {/* Report Display */}
            {loading ? (
                <div className="loading-report">
                    <div className="spinner"></div>
                    <p>Generating report...</p>
                </div>
            ) : reportData && (
                <div className="report-display">
                    {renderReport()}
                </div>
            )}
        </div>
    );

    function renderReport() {
        switch (activeReport) {
            case 'student':
                return renderStudentReport();
            case 'department':
                return renderDepartmentReport();
            case 'semester':
                return renderSemesterReport();
            case 'cgpa':
                return renderCGPAReport();
            default:
                return null;
        }
    }

    function renderStudentReport() {
        if (!reportData?.student) return null;
        
        return (
            <div className="student-report">
                <div className="report-header">
                    <h3>Academic Performance Report</h3>
                    <div className="report-meta">
                        <span>Student ID: {reportData.student.studentId}</span>
                        <span>Department: {reportData.student.department}</span>
                        <span>Semester: {reportData.student.semester}</span>
                    </div>
                </div>

                <div className="student-info">
                    <h4>Student Information</h4>
                    <div className="info-grid">
                        <div><strong>Name:</strong> {reportData.student.name}</div>
                        <div><strong>Student ID:</strong> {reportData.student.studentId}</div>
                        <div><strong>Department:</strong> {reportData.student.department}</div>
                        <div><strong>Current Semester:</strong> {reportData.student.semester}</div>
                        <div><strong>Academic Year:</strong> {reportData.student.academicYear}</div>
                        <div><strong>CGPA:</strong> 
                            <span style={{ color: getCGPAColor(reportData.cgpa), fontWeight: 'bold', marginLeft: '8px' }}>
                                {reportData.cgpa}
                            </span>
                        </div>
                        <div><strong>Status:</strong> 
                            <span className={`status ${reportData.status.toLowerCase()}`}>
                                {reportData.status}
                            </span>
                        </div>
                        <div><strong>Credits Earned:</strong> {reportData.earnedCredits}/{reportData.totalCredits}</div>
                    </div>
                </div>

                {/* Semester-wise Performance */}
                {reportData.semesterPerformance && Object.keys(reportData.semesterPerformance).length > 0 && (
                    <div className="semester-performance">
                        <h4>Semester-wise Performance</h4>
                        <div className="semester-cards">
                            {Object.entries(reportData.semesterPerformance).map(([semester, data]) => (
                                <div key={semester} className="semester-card">
                                    <h5>Semester {semester}</h5>
                                    <div className="semester-stats">
                                        <div className="stat">
                                            <span className="label">SGPA</span>
                                            <span className="value" style={{ color: getCGPAColor(data.sgpa || 0) }}>
                                                {data.sgpa || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="stat">
                                            <span className="label">Passed</span>
                                            <span className="value">{data.passedSubjects}/{data.totalSubjects}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="label">Credits</span>
                                            <span className="value">{data.earnedCredits}/{data.totalCredits}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Marks Breakdown */}
                {reportData.marksBreakdown && reportData.marksBreakdown.length > 0 && (
                    <div className="marks-breakdown">
                        <h4>Subject-wise Performance</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sem</th>
                                    <th>Subject</th>
                                    <th>Code</th>
                                    <th>Credits</th>
                                    <th>Total Marks</th>
                                    <th>Grade</th>
                                    <th>Points</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.marksBreakdown.map((subject, index) => (
                                    <tr key={index}>
                                        <td>{subject.semester}</td>
                                        <td>{subject.subject}</td>
                                        <td>{subject.code}</td>
                                        <td>{subject.credits}</td>
                                        <td>{subject.totalMarks}</td>
                                        <td style={{ 
                                            color: getGradeColor(subject.grade),
                                            fontWeight: 'bold'
                                        }}>
                                            {subject.grade}
                                        </td>
                                        <td>{subject.gradePoints}</td>
                                        <td className={subject.result === 'Pass' ? 'pass' : 'fail'}>
                                            {subject.result}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="summary">
                    <h4>Academic Summary</h4>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <span className="label">Overall CGPA</span>
                            <span className="value" style={{ color: getCGPAColor(reportData.cgpa) }}>
                                {reportData.cgpa}
                            </span>
                        </div>
                        <div className="summary-card">
                            <span className="label">Credits Completed</span>
                            <span className="value">{reportData.earnedCredits}/{reportData.totalCredits}</span>
                        </div>
                        <div className="summary-card">
                            <span className="label">Completion %</span>
                            <span className="value">
                                {reportData.totalCredits > 0 ? 
                                    ((reportData.earnedCredits / reportData.totalCredits) * 100).toFixed(1) + '%' : 
                                    '0%'}
                            </span>
                        </div>
                        <div className="summary-card">
                            <span className="label">Academic Status</span>
                            <span className={`status ${reportData.status.toLowerCase()}`}>
                                {reportData.status}
                            </span>
                        </div>
                    </div>
                    <div className="remark">
                        <strong>Academic Advisor Remark:</strong> {reportData.progressRemark || 'No remarks available'}
                    </div>
                </div>
            </div>
        );
    }

    function renderDepartmentReport() {
        if (!reportData) return null;
        
        return (
            <div className="department-report">
                <div className="report-header">
                    <h3>Department Performance Report - {reportData.department}</h3>
                    <div className="report-meta">
                        <span>Total Students: {reportData.totalStudents}</span>
                        <span>Average CGPA: {reportData.averageCGPA?.toFixed(2) || 'N/A'}</span>
                    </div>
                </div>

                <div className="department-stats">
                    <h4>Department Statistics</h4>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="label">Total Students</span>
                            <span className="value">{reportData.totalStudents}</span>
                        </div>
                        <div className="stat-card">
                            <span className="label">Average CGPA</span>
                            <span className="value">{reportData.averageCGPA?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="stat-card">
                            <span className="label">Pass Rate</span>
                            <span className="value">
                                {reportData.totalStudents > 0 ? 
                                    ((reportData.passedStudents / reportData.totalStudents) * 100).toFixed(1) + '%' : 
                                    '0%'}
                            </span>
                        </div>
                        <div className="stat-card">
                            <span className="label">Active Students</span>
                            <span className="value">{reportData.activeStudents || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Semester Distribution */}
                {reportData.semesterDistribution && (
                    <div className="semester-distribution">
                        <h4>Semester Distribution</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Semester</th>
                                    <th>Number of Students</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(reportData.semesterDistribution).map(([sem, count]) => (
                                    <tr key={sem}>
                                        <td>Semester {sem}</td>
                                        <td>{count}</td>
                                        <td>
                                            {((count / reportData.totalStudents) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Top Performers */}
                {reportData.topPerformers && reportData.topPerformers.length > 0 && (
                    <div className="top-performers">
                        <h4>Top 10 Performers</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Student ID</th>
                                    <th>Semester</th>
                                    <th>CGPA</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.topPerformers.map((student, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{student.name}</td>
                                        <td>{student.studentId}</td>
                                        <td>Sem {student.semester}</td>
                                        <td style={{ color: getCGPAColor(student.cgpa), fontWeight: 'bold' }}>
                                            {student.cgpa}
                                        </td>
                                        <td style={{ 
                                            color: getGradeColor(student.grade),
                                            fontWeight: 'bold'
                                        }}>
                                            {student.grade}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    function renderSemesterReport() {
        if (!reportData) return null;
        
        return (
            <div className="semester-report">
                <div className="report-header">
                    <h3>Semester Analysis Report</h3>
                    <div className="report-meta">
                        <span>Department: {reportData.department}</span>
                        <span>Semester: {reportData.semester}</span>
                        <span>Total Students: {reportData.totalStudents || 0}</span>
                    </div>
                </div>

                {/* Add semester-specific report content here */}
                <div className="no-data">
                    <p>Semester analysis report will be displayed here</p>
                </div>
            </div>
        );
    }

    function renderCGPAReport() {
        if (!reportData) return null;
        
        return (
            <div className="cgpa-report">
                <div className="report-header">
                    <h3>CGPA Analysis Report - Entire College</h3>
                    <div className="report-meta">
                        <span>Report Date: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Add CGPA analysis content here */}
                <div className="no-data">
                    <p>CGPA analysis report will be displayed here</p>
                </div>
            </div>
        );
    }
}

export default Reports;