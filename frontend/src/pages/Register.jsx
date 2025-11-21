import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Form } from '../styles/mainStyles';
import { PageBody } from '../styles/mainStyles';
import { ErrorContext } from '../context';
import { API_BASE_URL } from '../constants';

function Register({ setToken, setOwner }) {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ confirmPassword, setConfirmPassword ] = useState('');
  const [ name, setName ] = useState('');

  const navigate = useNavigate();
  const setShowErrorPopup = useContext(ErrorContext);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') registerUser();
  };
  
  const registerUser = async () => {
    if (password !== confirmPassword) return setShowErrorPopup('Confirmation password and password do not match');
    try {
      const response = await axios.post(`${API_BASE_URL}user/auth/register`, {email, password, name });
      localStorage.setItem('token', response.data.token);
      
      localStorage.setItem('owner', email);

      setToken(response.data.token);
      setOwner(email);

      navigate('/dashboard');
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  };
  
  return (
    <PageBody>
      <Form>
        <h1>Register</h1>
        <TextField
          id='register-email-input'
          label='Email'
          type='email'
          variant='outlined'
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <br />
        <TextField
          id='register-password-input'
          label='Password'
          type='password'
          variant='outlined'
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <br />
        <TextField
          id='register-confirm-password-input'
          label='Confirm Password'
          type='password'
          variant='outlined'
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <br />
        <TextField
          id='register-name-input'
          label='Name'
          type='email'
          variant='outlined'
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <br />
        <Button
          variant='contained'
          onClick={registerUser}
        >
          Register
        </Button>
      </Form>
    </PageBody>
  )
}

export default Register;
