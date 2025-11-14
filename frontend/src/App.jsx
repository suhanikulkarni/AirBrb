import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

import styles from './css/App.module.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/createListing';

function App() {
  const [ token, setToken ] = useState('LOADING');

  useEffect(() => {
    const lsToken = localStorage.getItem('token');
    setToken(lsToken);
  }, []);

  const logoutUser = async () => {
    await axios.post('http://localhost:5005/user/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <div>
      <header>
        <nav>
          {token && token !== 'LOADING' ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {" "}
              <a href="#" onClick={logoutUser}>Logout</a>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              {" "}
              <Link to="/login">Login</Link>
            </>
          )}
        </nav>
      </header>
      <Routes>
        {token !== 'LOADING' && (
          <>
            <Route path="/" element={<h1>hello world</h1>} />
            <Route path="/login" element={<Login setToken={setToken}/>} />
            <Route path="/register" element={<Register setToken={setToken}/>} />
            <Route path="/dashboard" element={<Dashboard token={token} />} />
            <Route path="/createListing" element={<CreateListing token={token} />} />

          </>
        )}
      </Routes>
    </div>
  )
}

export default App;
