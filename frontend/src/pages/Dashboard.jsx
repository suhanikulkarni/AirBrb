import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { PageBody } from '../styles/mainStyles';

function Dashboard({ token }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  return (
    <PageBody>
      <Link to='/createListing'>Create A Listing</Link>
      <Link to='/viewHostedListings'>View All Listings</Link>
    </PageBody>
  )
}

export default Dashboard;
