import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Button from '@mui/material/Button';

import { Page, NavBar, NavRight, NavLeft } from './styles/mainStyles';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ViewListing from './pages/ViewListing';
import { ErrorContext } from './context';
import ErrorPopup from './pages/ErrorPopup';
import { API_BASE_URL } from './constants';
import ListingInfo from './pages/ListingInfo';
import TemporaryConfirmation from './pages/TemporaryConnfirmation';

function App() {
  const [token, setToken] = useState('LOADING');
  const [owner, setOwner] = useState('');

  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const navigate = useNavigate('/dashboard');

  useEffect(() => {
    const lsToken = localStorage.getItem('token');
    setToken(lsToken);

    const owner1 = localStorage.getItem('owner');
    setOwner(owner1);


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
          {token ? (
            <>
              <NavLeft>
                <Button
                  onClick={() => navigate('/')}
                >Home</Button>
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
                  onClick={() => navigate('/viewListings')}
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
              <Route path="/" element={<ViewListing token = {token} owner = {owner} />} />
              <Route path="/login" element={<Login setToken={setToken} setOwner={setOwner}/>} />
              <Route path="/viewListings/:id" element={<ListingInfo token={token}/>} />
              <Route path="/temporaryConfirmation" element={<TemporaryConfirmation token={token}/>} />
              <Route path="/register" element={<Register setToken={setToken} setOwner={setOwner} />} />
              <Route path="/dashboard">
                <Route index element={<Dashboard token={token} owner={owner} />} />
                <Route path="create-listing" element={<CreateListing token={token} />} />
                <Route path="edit-listing" element={<EditListing token={token} />} />
              </Route>
            </>
          )}
        </Routes>
      </Page>
    </ErrorContext.Provider>
  );
}

export default App;
