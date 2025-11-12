import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import styles from './css/App.module.css';

import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>
          {" "}
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<h1>hello world</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />    
        <Route path="/createListing" element={<createListing />} />    

      </Routes>
    </div>
  )
}

export default App
