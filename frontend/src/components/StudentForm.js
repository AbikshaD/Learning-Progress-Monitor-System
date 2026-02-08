import React, { useState, useEffect } from 'react';
import './StudentForm.css';

function StudentForm({ student, onSave, onCancel, isEditing }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: 'CSE',
        semester: 1,
        section: 'A',
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        studentId: '',
        dateOfBirth: '',
        address: ''
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const departments = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEMICAL', 'AERO'];
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const sections = ['A', 'B', 'C', 'D'];

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                email: student.email || '',
                phone: student.phone || '',
                department: student.department || 'CSE',
                semester: student.semester || 1,
                section: student.section || 'A',
                academicYear: student.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                studentId: student.studentId || '',
                dateOfBirth: student.dateOfBirth ? 
                    new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
                address: student.address || ''
            });
        }
    }, [student]);

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.academicYear.match(/^\d{4}-\d{4}$/)) {
            newErrors.academicYear = 'Academic year must be in format: YYYY-YYYY';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be 10 digits';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }
        
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            alert('Error saving student: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-form-modal">
            <div className="form-overlay" onClick={onCancel}></div>
            <div className="form-container">
                <div className="form-header">
                    <h2>{isEditing ? 'Edit Student Record' : 'Add New Engineering Student'}</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">
                                Full Name <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="studentId">Student ID</label>
                            <input
                                id="studentId"
                                name="studentId"
                                type="text"
                                value={formData.studentId}
                                onChange={handleChange}
                                placeholder="Auto-generated if empty"
                                disabled={isEditing}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="student@college.edu"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit phone number"
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="department">
                                Department <span className="required">*</span>
                            </label>
                            <select
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>
                                        {dept} - {getDepartmentFullName(dept)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="semester">
                                Semester <span className="required">*</span>
                            </label>
                            <select
                                id="semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                            >
                                {semesters.map(sem => (
                                    <option key={sem} value={sem}>
                                        Semester {sem}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="section">Section</label>
                            <select
                                id="section"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                            >
                                {sections.map(sec => (
                                    <option key={sec} value={sec}>
                                        Section {sec}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="academicYear">
                                Academic Year <span className="required">*</span>
                            </label>
                            <input
                                id="academicYear"
                                name="academicYear"
                                type="text"
                                value={formData.academicYear}
                                onChange={handleChange}
                                placeholder="YYYY-YYYY"
                                className={errors.academicYear ? 'error' : ''}
                            />
                            {errors.academicYear && <span className="error-text">{errors.academicYear}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group full-width">
                            <label htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter complete address"
                                rows="3"
                            />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Saving...' : (isEditing ? 'Update Record' : 'Add Student')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function getDepartmentFullName(code) {
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
}

export default StudentForm;