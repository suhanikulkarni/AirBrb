import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';

import { Page, NavBar, NavRight, NavLeft, PageBody } from './styles/mainStyles';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import { ErrorContext } from './context';
import ErrorPopup from './pages/ErrorPopup';
import { API_BASE_URL } from './constants';

function App() {
  const [token, setToken] = useState('LOADING');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const navigate = useNavigate('/dashboard');

  useEffect(() => {
    const lsToken = localStorage.getItem('token');
    setToken(lsToken);
  }, []);

  const logoutUser = async () => {
    await axios.post(`${API_BASE_URL}user/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <ErrorContext.Provider value={setShowErrorPopup}>
      <Page>
        <NavBar>
          {token && token !== 'LOADING' ? (
            <>
              <NavLeft>
                <Button
                  onClick={() => navigate('/')}
                >Listings</Button>
              </NavLeft>
              {" "}
              <NavRight>
                <Button
                  onClick={() => navigate('/dashboard')}
                >Your Listings</Button>
                {" "}
                <Button
                  variant="contained"
                  onClick={() => logoutUser()}
                >Logout</Button>
              </NavRight>
            </>
          ) : (
            <>
              <NavLeft>
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                >Listing</Button>
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
        <ErrorPopup showErrorPopup={showErrorPopup} closeErrorPopup={() => setShowErrorPopup(false)} />
        <Routes>
          {token !== 'LOADING' && (
            <>
              <Route path="/" element={<PageBody>hello world</PageBody>} />
              <Route path="/login" element={<Login setToken={setToken}/>} />
              <Route path="/register" element={<Register setToken={setToken}/>} />
              <Route path="/dashboard">
                <Route index element={<Dashboard token={token} />} />
                <Route path="create-listing" element={<CreateListing token={token} />} />
              </Route>
            </>
          )}
        </Routes>
      </Page>
    </ErrorContext.Provider>
  );
}

export default App;
