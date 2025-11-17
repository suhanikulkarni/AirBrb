import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Button from '@mui/material/Button';

import { PageBody } from '../styles/mainStyles';

function Dashboard({ token }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  return (
    <PageBody>
      <Button
        variant="contained"
        onClick={() => navigate('create-listing')}
      >Create A Listing</Button>
      <Link to='view-hosted-listings'>View All Listings</Link>
    </PageBody>
  )
}

export default Dashboard;
