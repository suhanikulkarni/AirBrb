import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { Page, PageBody } from '../styles/mainStyles';

function Login({ setToken }) {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  
  const navigate = useNavigate('/dashboard');

  const loginUser = async () => {
    try {
      const response = await axios.post('http://localhost:5005/user/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <PageBody>
      <h1>Login</h1>
      <TextField
        id="login-email-input"
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br />
      <TextField
        id="login-password-input"
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <Button
        variant="contained"
        onClick={loginUser}
      >
        Login
      </Button>
      <br />
      <span>Not a user? <Link to='/register'>Register here</Link></span>
    </PageBody>
  )
}

export default Login;
