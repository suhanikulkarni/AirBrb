import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import styles from '../css/Auth.module.css';

function Register() {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ confirmPassword, setConfirmPassword ] = useState('');
  const [ name, setName ] = useState('');

  const navigate = useNavigate();
  
  const registerUser = async () => {
    console.log(email, password, confirmPassword, name);

    try {
      const response = await axios.post('http://localhost:5005/user/auth/register', { email, password, name });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <div>
      <h1>Register</h1><br />
      <TextField
        id="register-email-input"
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br />
      <TextField
        id="register-password-input"
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <TextField
        id="register-confirm-password-input"
        label="Confirm Password"
        type="password"
        variant="outlined"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />
      <br />
      <TextField
        id="register-name-input"
        label="Name"
        type="email"
        variant="outlined"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <br />
      <Button
        variant="contained"
        onClick={registerUser}
      >
        Register
      </Button>
    </div>
  )
}

export default Register;
