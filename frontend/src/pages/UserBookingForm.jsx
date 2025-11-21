import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-multi-date-picker';
import { ErrorContext } from '../context';
import { API_BASE_URL } from '../constants';
import styles from '../styles/listingStyles.module.css';
import { Box, Button, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';

function UsersBookingForm({price, listingId, token}) {
  const [bookingDates, setBookingDates] = useState();
  const [totalPrice, setTotalPrice] = useState();
  const navigate = useNavigate();
  
  const setShowErrorPopup = useContext(ErrorContext); 
  useEffect(() => {
    if (bookingDates && bookingDates.length === 2) {
      const nights = calculateNumOfNights();
      setTotalPrice(nights * price);
    }
  }, [bookingDates]);

  const calculateNumOfNights = () => { 
    if (!bookingDates || bookingDates.length !== 2) return 0;

    const start = bookingDates[0].toDate();
    const end = bookingDates[1].toDate();

    const diffMs = end - start;
    const nights = diffMs / (1000 * 60 * 60 * 24);

    return nights;
  };

  const submitBooking = async () => {
    const dates = {
      start: bookingDates[0].format('YYYY-MM-DD'),
      end: bookingDates[1].format('YYYY-MM-DD')
    };

    const body = {
      dateRange: dates,
      totalPrice: totalPrice
    };

    try {
      await axios.post(
        `${API_BASE_URL}bookings/new/${listingId}`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/temporaryConfirmation')
    } catch (error) {
      setShowErrorPopup(error.response?.data?.error || 'Booking failed.');
    }
  };


  return (
    <Box>
      <h3 className={styles.title}>Booking</h3>
      <InputLabel>Select Booking Dates</InputLabel>
      <DatePicker 
        range 
        value={bookingDates} 
        onChange={setBookingDates} 
        placeholder='Select booking dates'
        render={
          <TextField
            sx={{
              width: '400px'
            }}
            placeholder='Select from available dates'
          />
        }
      />

      {bookingDates && bookingDates.length === 2 &&(
        <Box>
          Booking: {bookingDates[0].format('DD/MM/YYYY')} to {bookingDates[1].format('DD/MM/YYYY')} <br />
          Number Of Nights: {calculateNumOfNights() } nights<br/>

          Price: ${totalPrice}<br/>
          <Button
            variant='outlined'
            onClick={submitBooking}
          >Book Now</Button>
        </Box>
      )}
    </Box>
  )
}
export default UsersBookingForm;