import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Button from '@mui/material/Button';

import { PageBody } from '../styles/mainStyles';

import ViewHostedListings from './ViewHostedListings';

function Dashboard({ token, owner }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  return (
    <PageBody>
      <Button
        variant="contained"
        onClick={() => navigate('create-listing')}
      >Create A New Listing</Button>
      <ViewHostedListings owner={owner} token={token} />
    </PageBody>
  )
}

export default Dashboard;
