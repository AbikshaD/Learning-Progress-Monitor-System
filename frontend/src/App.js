import React, { useState, useEffect } from 'react';
import './App.css';
import MarksEntry from './components/MarksEntry';
import StudentForm from './components/StudentForm';
import Reports from './components/Reports';

function App() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    academicYear: '',
    status: ''
  });
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    semesters: [],
    academicYears: [],
    statuses: []
  });

  useEffect(() => {
    fetchData();
    fetchStatistics();
    fetchFilterOptions();
  }, [filters, pagination.page, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/students?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const [studentsRes, subjectsRes] = await Promise.all([
        fetch(url),
        fetch('http://localhost:5000/api/subjects')
      ]);
      
      const studentsData = await studentsRes.json();
      const subjectsData = await subjectsRes.json();
      
      setStudents(studentsData.students || studentsData);
      setSubjects(subjectsData);
      
      if (studentsData.pagination) {
        setPagination(studentsData.pagination);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students/filters/options');
      const data = await response.json();
      setFilterOptions({
        departments: data.departments || [],
        semesters: data.semesters || [],
        academicYears: data.academicYears || [],
        statuses: data.statuses || []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSaveStudent = async (studentData) => {
    try {
      const url = editingStudent 
        ? `http://localhost:5000/api/students/${editingStudent._id}`
        : 'http://localhost:5000/api/students';
      
      const method = editingStudent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save student');
      }
      
      const data = await response.json();
      
      if (editingStudent) {
        setStudents(prev => prev.map(s => 
          s._id === editingStudent._id ? data : s
        ));
      } else {
        setStudents(prev => [data, ...prev]);
      }
      
      setShowStudentForm(false);
      setEditingStudent(null);
      alert(`✅ Student ${editingStudent ? 'updated' : 'added'} successfully!`);
      fetchStatistics();
      fetchFilterOptions();
    } catch (error) {
      alert(`❌ Error saving student: ${error.message}`);
      throw error;
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete student');
      
      const data = await response.json();
      setStudents(prev => prev.filter(s => s._id !== studentId));
      alert(`✅ ${data.message}`);
      fetchStatistics();
    } catch (error) {
      alert(`❌ Error deleting student: ${error.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedStudents })
      });
      
      if (!response.ok) throw new Error('Failed to delete students');
      
      const data = await response.json();
      setStudents(prev => prev.filter(s => !selectedStudents.includes(s._id)));
      setSelectedStudents([]);
      alert(`✅ ${data.message}`);
      fetchStatistics();
    } catch (error) {
      alert(`❌ Error deleting students: ${error.message}`);
    }
  };

  const toggleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const loadTestData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test-data');
      const data = await response.json();
      alert(`✅ ${data.message}`);
      fetchData();
      fetchStatistics();
      fetchFilterOptions();
    } catch (error) {
      alert('❌ Error loading test data: ' + error.message);
    }
  };

  const loadTestMarks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test-marks');
      const data = await response.json();
      alert(`✅ ${data.message}`);
      fetchData();
      fetchStatistics();
    } catch (error) {
      alert('❌ Error loading test marks: ' + error.message);
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

  const getCGPAColor = (cgpa) => {
    if (cgpa >= 9) return '#28a745';
    if (cgpa >= 8) return '#20c997';
    if (cgpa >= 7) return '#ffc107';
    if (cgpa >= 6) return '#fd7e14';
    if (cgpa >= 5) return '#dc3545';
    return '#6c757d';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Active': '#007bff',
      'Passed': '#28a745',
      'Failed': '#dc3545',
      'Graduated': '#17a2b8',
      'Dropout': '#6c757d',
      'Not Evaluated': '#ffc107'
    };
    return statusColors[status] || '#6c757d';
  };

  const getDepartmentFullName = (code) => {
    const deptNames = {
      'CSE': 'Computer Science & Engineering',
      'IT': 'Information Technology',
      'ECE': 'Electronics & Communication Engineering',
      'EEE': 'Electrical & Electronics Engineering',
      'MECH': 'Mechanical Engineering',
      'CIVIL': 'Civil Engineering',
      'CHEMICAL': 'Chemical Engineering',
      'AERO': 'Aeronautical Engineering'
    };
    return deptNames[code] || code;
  };

  if (loading && students.length === 0) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="spinner"></div>
          <h2>Loading Engineering College Academic System...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏛️ Engineering College Academic Tracker</h1>
        <p>Comprehensive Student Performance Monitoring System</p>
        
        {statistics && (
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{statistics.totalStudents || 0}</span>
              <span className="stat-label">Total Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statistics.totalDepartments || 8}</span>
              <span className="stat-label">Departments</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statistics.averageCGPA?.toFixed(2) || '0.00'}</span>
              <span className="stat-label">Avg CGPA</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statistics.graduatedStudents || 0}</span>
              <span className="stat-label">Graduated</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statistics.passPercentage || '0'}%</span>
              <span className="stat-label">Pass Rate</span>
            </div>
          </div>
        )}
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'students' ? 'active' : ''} 
          onClick={() => setActiveTab('students')}
        >
          👨‍🎓 Students ({students.length})
        </button>
        <button 
          className={activeTab === 'subjects' ? 'active' : ''} 
          onClick={() => setActiveTab('subjects')}
        >
          📚 Courses ({subjects.length})
        </button>
        <button 
          className={activeTab === 'marks' ? 'active' : ''} 
          onClick={() => setActiveTab('marks')}
        >
          📝 Marks Entry
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          📊 Academic Reports
        </button>
        <div className="test-buttons">
          <button 
            className="test-btn"
            onClick={loadTestData}
          >
            🔄 Load Test Data
          </button>
          <button 
            className="test-btn marks-btn"
            onClick={loadTestMarks}
          >
            📊 Test Marks
          </button>
        </div>
      </nav>

      <main className="App-main">
        {activeTab === 'students' && (
          <div className="section">
            <div className="section-header">
              <h2>👨‍🎓 Student Management</h2>
              <button 
                className="add-btn"
                onClick={() => {
                  setEditingStudent(null);
                  setShowStudentForm(true);
                }}
              >
                ➕ Add Student
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className="controls">
              <form className="search-box" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search by name, student ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">🔍 Search</button>
                {searchTerm && (
                  <button 
                    type="button" 
                    className="clear-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </button>
                )}
              </form>
              
              <div className="filters">
                <select 
                  value={filters.department} 
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.semester} 
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {filterOptions.semesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.academicYear} 
                  onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                >
                  <option value="">All Academic Years</option>
                  {filterOptions.academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  {filterOptions.statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedStudents.length > 0 && (
              <div className="bulk-actions">
                <span>{selectedStudents.length} students selected</span>
                <button 
                  className="bulk-delete-btn"
                  onClick={handleBulkDelete}
                >
                  🗑️ Delete Selected
                </button>
              </div>
            )}
            
            {/* Student List */}
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th width="50">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>CGPA</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">
                        No students found. Try adding some or adjusting your filters.
                      </td>
                    </tr>
                  ) : (
                    students.map(student => (
                      <tr key={student._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => toggleSelectStudent(student._id)}
                          />
                        </td>
                        <td>
                          <strong>{student.studentId}</strong>
                        </td>
                        <td>
                          <div className="student-info-cell">
                            <div className="student-name">{student.name}</div>
                            {student.email && (
                              <div className="student-email">{student.email}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="department-badge" style={{ 
                            backgroundColor: getDepartmentColor(student.department) 
                          }}>
                            {student.department}
                          </span>
                        </td>
                        <td>
                          <span className="semester-badge">
                            Sem {student.semester}
                            {student.section && ` - ${student.section}`}
                          </span>
                        </td>
                        <td>
                          <span className="cgpa-display" style={{ 
                            color: getCGPAColor(student.cgpa),
                            fontWeight: 'bold'
                          }}>
                            {student.cgpa.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="grade-badge"
                            style={{ 
                              backgroundColor: getGradeColor(student.grade),
                              color: 'white'
                            }}
                          >
                            {student.grade}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ 
                              backgroundColor: getStatusColor(student.status),
                              color: 'white'
                            }}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit"
                              onClick={() => handleEditStudent(student)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteStudent(student._id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                            <button 
                              className="btn-view"
                              onClick={() => {
                                // Will navigate to student details in next phase
                                alert('Student details view will be added in next phase');
                              }}
                              title="View Details"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    ← Previous
                  </button>
                  
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button 
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="section">
            <div className="section-header">
              <h2>📚 Course Management</h2>
              <button className="add-btn" onClick={() => alert('Add subject feature coming soon')}>
                ➕ Add Course
              </button>
            </div>
            
            {/* Course List */}
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Credits</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => (
                    <tr key={subject._id}>
                      <td><strong>{subject.subjectCode}</strong></td>
                      <td>{subject.name}</td>
                      <td>
                        <span className="department-badge" style={{ 
                          backgroundColor: getDepartmentColor(subject.department) 
                        }}>
                          {subject.department}
                        </span>
                      </td>
                      <td>
                        <span className="semester-badge">
                          Sem {subject.semester}
                        </span>
                      </td>
                      <td>
                        <span className="credits-badge">
                          {subject.credits} Credits
                        </span>
                      </td>
                      <td>
                        <span className={`type-badge ${subject.type.toLowerCase()}`}>
                          {subject.type}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-edit" title="Edit Course">
                            ✏️
                          </button>
                          <button className="btn-delete" title="Delete Course">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="section">
            <MarksEntry 
              students={students}
              subjects={subjects}
              onMarkAdded={() => {
                fetchData();
                fetchStatistics();
              }}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="section">
            <Reports />
          </div>
        )}
      </main>

      {/* Student Form Modal */}
      {showStudentForm && (
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={() => {
            setShowStudentForm(false);
            setEditingStudent(null);
          }}
          isEditing={!!editingStudent}
        />
      )}

      <footer className="App-footer">
        <p>Engineering College Academic Tracker v4.0 | Comprehensive Performance Monitoring System</p>
        <p className="footer-links">
          <span>Total Students: {students.length}</span> • 
          <span>Departments: {filterOptions.departments.length}</span> • 
          <span>Avg CGPA: {statistics?.averageCGPA?.toFixed(2) || '0.00'}</span> •
          <span>Version: Engineering Edition</span>
        </p>
      </footer>
    </div>
  );
}

// Helper function to get department colors
function getDepartmentColor(dept) {
  const deptColors = {
    'CSE': '#3498db',
    'IT': '#2ecc71',
    'ECE': '#9b59b6',
    'EEE': '#e74c3c',
    'MECH': '#f39c12',
    'CIVIL': '#1abc9c',
    'CHEMICAL': '#d35400',
    'AERO': '#34495e',
    'COMMON': '#7f8c8d'
  };
  return deptColors[dept] || '#95a5a6';
}

export default App;