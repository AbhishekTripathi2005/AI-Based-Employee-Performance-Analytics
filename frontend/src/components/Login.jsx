import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken, API_BASE }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = isLogin ? '/auth/login' : '/auth/signup';
      const res = await axios.post(API_BASE + url, form);

      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } else {
        setMessage("✅ Signup Successful! Now Login");
        setIsLogin(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>{isLogin ? "Admin Login" : "Create Account"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input type="text" placeholder="Full Name" required
            onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        )}
        <input type="email" placeholder="Email" required
          onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        <input type="password" placeholder="Password" required
          onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
        </button>
      </form>

      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'blue', marginTop: '15px' }}>
        {isLogin ? "Don't have account? Sign Up" : "Already have account? Login"}
      </p>
      {message && <p style={{ color: message.includes("✅") ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' };
const buttonStyle = { width: '100%', padding: '12px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' };

export default Login;