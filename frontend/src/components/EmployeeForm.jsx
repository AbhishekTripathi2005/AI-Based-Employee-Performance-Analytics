import React, { useState } from 'react';
import axios from 'axios';

const EmployeeForm = ({ API_BASE, token }) => {
  const [form, setForm] = useState({
    name: '', email: '', department: '', skills: '', performanceScore: '', experience: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = form.skills.split(',').map(s => s.trim());
      const data = { ...form, skills: skillsArray, performanceScore: Number(form.performanceScore), experience: Number(form.experience) };

      await axios.post(`${API_BASE}/employees`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("✅ Employee Added Successfully!");
      setForm({ name: '', email: '', department: '', skills: '', performanceScore: '', experience: '' });
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto' }}>
      <h2>Add New Employee</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Department" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Skills (comma separated)" required value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} style={inputStyle} />
        <input type="number" placeholder="Performance Score (0-100)" required value={form.performanceScore} onChange={(e) => setForm({ ...form, performanceScore: e.target.value })} style={inputStyle} />
        <input type="number" placeholder="Years of Experience" required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} style={inputStyle} />

        <button type="submit" style={buttonStyle}>Add Employee</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '5px', border: '1px solid #ccc' };
const buttonStyle = { width: '100%', padding: '12px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', marginTop: '10px' };

export default EmployeeForm;