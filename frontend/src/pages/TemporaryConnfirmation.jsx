import { Button } from "@mui/material"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"



function TemporaryConfirmation({ token }) {
  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);


  const goToDashboard = () => {
    navigate('/')
  }

  const navigate = useNavigate();
  return (
    <>
      The booking has been confirmed, please wait to hear back from the host to see if they accepted or declined your booking
      <Button
  
        onClick={goToDashboard}
      >
        Listings
      </Button>
    </>
  )
}

export default TemporaryConfirmation