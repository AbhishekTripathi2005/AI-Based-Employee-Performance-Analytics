import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ token, logout }) => {
  return (
    <nav style={{
      background: '#1976d2',
      color: 'white',
      padding: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h2>AI Employee Analytics</h2>
      <div>
        {token ? (
          <>
            <Link to="/employees" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Employees</Link>
            <Link to="/add-employee" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Add Employee</Link>
            <Link to="/ai-recommend" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>AI Recommendation</Link>
            <button onClick={logout} style={{ marginLeft: '15px', padding: '8px 15px' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;