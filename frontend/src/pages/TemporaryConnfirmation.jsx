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
      BLANFKNGF NFGS I AM LEVITATION
      <Button
  
        onClick={goToDashboard}
      >
        Listings
      </Button>
    </>
  )
}

export default TemporaryConfirmation