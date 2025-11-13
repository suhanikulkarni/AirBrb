import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';

import { Page, NavBar, NavRight, NavLeft, PageBody } from './styles/mainStyles';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [ token, setToken ] = useState('LOADING');

  const navigate = useNavigate('/dashboard');

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
    <Page>
      <NavBar>
        {token && token !== 'LOADING' ? (
          <>
            <NavLeft>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
              >Dashboard</Button>
            </NavLeft>
            {" "}
            <NavRight>
              <Button
                variant="contained"
                onClick={() => navigate('#')}
              >Logout</Button>
            </NavRight>
          </>
        ) : (
          <>
            <NavLeft>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
              >Home</Button>
            </NavLeft>
            {" "}
            <NavRight>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
              >Login</Button>
            </NavRight>
          </>
        )}
      </NavBar>
      <Routes>
        {token !== 'LOADING' && (
          <>
            <Route path="/" element={<PageBody>hello world</PageBody>} />
            <Route path="/login" element={<Login setToken={setToken}/>} />
            <Route path="/register" element={<Register setToken={setToken}/>} />
            <Route path="/dashboard" element={<Dashboard token={token} />} />
          </>
        )}
      </Routes>
    </Page>
  )
}

export default App;
