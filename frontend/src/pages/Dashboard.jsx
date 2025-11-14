import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard({ token }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  return (
    <>
      <Link to='/createListing'>Create A Listing</Link>
    </>
  )
}

export default Dashboard;
