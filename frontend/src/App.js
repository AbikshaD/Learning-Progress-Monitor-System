import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newStudent, setNewStudent] = useState({ 
    studentId: '', 
    name: '', 
    class: '', 
    department: '' 
  });
  const [newSubject, setNewSubject] = useState({ 
    code: '', 
    name: '' 
  });
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        fetch('http://localhost:5000/api/students'),
        fetch('http://localhost:5000/api/subjects')
      ]);
      
      const studentsData = await studentsRes.json();
      const subjectsData = await subjectsRes.json();
      
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      
      if (!response.ok) throw new Error('Failed to add student');
      
      const data = await response.json();
      setStudents([...students, data]);
      setNewStudent({ studentId: '', name: '', class: '', department: '' });
      alert('Student added successfully!');
    } catch (error) {
      alert('Error adding student: ' + error.message);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });
      
      if (!response.ok) throw new Error('Failed to add subject');
      
      const data = await response.json();
      setSubjects([...subjects, data]);
      setNewSubject({ code: '', name: '' });
      alert('Subject added successfully!');
    } catch (error) {
      alert('Error adding subject: ' + error.message);
    }
  };

  const loadTestData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test-data');
      const data = await response.json();
      alert(data.message);
      fetchData();
    } catch (error) {
      alert('Error loading test data: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>📚 Learning Progress Monitor</h1>
        <p>Track and manage student academic performance</p>
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
          📖 Subjects ({subjects.length})
        </button>
        <button 
          className="test-btn"
          onClick={loadTestData}
        >
          🔄 Load Test Data
        </button>
      </nav>

      <main className="App-main">
        {activeTab === 'students' && (
          <div className="section">
            <h2>👨‍🎓 Student Management</h2>
            
            {/* Add Student Form */}
            <div className="form-container">
              <h3>Add New Student</h3>
              <form onSubmit={handleAddStudent}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Student ID (optional)"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Class *"
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Department *"
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                    required
                  />
                  <button type="submit">➕ Add Student</button>
                </div>
              </form>
            </div>

            {/* Student List */}
            <div className="list-container">
              <h3>Student List</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td>{student.studentId}</td>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>{student.department}</td>
                      <td>
                        <button className="btn-edit">✏️ Edit</button>
                        <button className="btn-delete">🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="section">
            <h2>📖 Subject Management</h2>
            
            {/* Add Subject Form */}
            <div className="form-container">
              <h3>Add New Subject</h3>
              <form onSubmit={handleAddSubject}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Subject Code *"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject Name *"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    required
                  />
                  <button type="submit">➕ Add Subject</button>
                </div>
              </form>
            </div>

            {/* Subject List */}
            <div className="list-container">
              <h3>Subject List</h3>
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => (
                    <tr key={subject._id}>
                      <td>{subject.code}</td>
                      <td>{subject.name}</td>
                      <td>
                        <button className="btn-edit">✏️ Edit</button>
                        <button className="btn-delete">🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Learning Progress Monitor v2.0 | Total Students: {students.length} | Total Subjects: {subjects.length}</p>
      </footer>
    </div>
  );
}

export default App;