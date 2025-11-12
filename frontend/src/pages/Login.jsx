import { useState } from 'react';
import { Link } from 'react-router-dom';

import styles from '../css/Auth.module.css';

function Login() {
  return (
    <div>
      Login
      <br />
      <Link to="/register">Not a user? Register now</Link>
    </div>
  )
}

export default Login