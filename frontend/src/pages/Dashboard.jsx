import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard({ token }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  return (
    <>
      hehe
    </>
  )
}

export default Dashboard;
