import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageBody } from '../styles/mainStyles';

function Dashboard({ token }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  return (
    <PageBody>
      hehe
    </PageBody>
  )
}

export default Dashboard;
