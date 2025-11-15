import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    </PageBody>
  )
}

export default Dashboard;
