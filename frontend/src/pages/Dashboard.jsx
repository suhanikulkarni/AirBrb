import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <h2>Your Hosted Listings</h2>
      <Button
        variant="contained"
        onClick={() => navigate('create-listing')}
      >Create A New Listing</Button>
      <br />
      <ViewHostedListings owner={owner} token={token} />
    </PageBody>
  )
}

export default Dashboard;
