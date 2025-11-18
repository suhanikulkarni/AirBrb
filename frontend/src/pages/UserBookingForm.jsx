import { useContext, useEffect, useState } from 'react';

import { Box, Button, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import DatePicker from 'react-multi-date-picker';

import { ErrorContext } from '../context';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

function UsersBookingForm({price, listingId, token}) {
  const [bookingDates, setBookingDates] = useState();
  const [totalPrice, setTotalPrice] = useState();
  // console.log("now im here@@@")
  const setShowErrorPopup = useContext(ErrorContext); 
  useEffect(() => {
    if (bookingDates && bookingDates.length === 2) {
      const nights = calculateNumOfNights();
      setTotalPrice(nights * price);
    }
  }, [bookingDates]);
  
  const calculatePrice = () => {
    const bookingDays = calculateNumOfNights();
    const totalPrice = bookingDays * price
    setTotalPrice(totalPrice);
    return totalPrice;
  }
  const calculateNumOfNights = () => { 
    if (!bookingDates || bookingDates.length !== 2) return 0;

    const start = bookingDates[0].toDate();
    const end = bookingDates[1].toDate();

    const diffMs = end - start;
    const nights = diffMs / (1000 * 60 * 60 * 24);

    return nights;
  }

  const submitBooking = async () => {

  const dates = {
    start: bookingDates[0].format("YYYY-MM-DD"),
    end: bookingDates[1].format("YYYY-MM-DD")
  };

  const body = {
    dateRange: dates,
    totalPrice: totalPrice
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}bookings/new/${listingId}`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("Booking success:", response.data);
  } catch (error) {
    console.log("Booking ERROR:", error);
    setShowErrorPopup(error.response?.data?.error || "Booking failed.");
  }
};


  return (
    <Box>
      <h4>Booking Information</h4>
      <InputLabel>Select Booking Dates</InputLabel>
      <DatePicker 
        range 
        value={bookingDates} 
        onChange={setBookingDates} 
        placeholder="Select booking dates"
      />

      {bookingDates && bookingDates.length === 2 &&(
        <Box>
          Booking: {bookingDates[0].format("DD/MM/YYYY")} to {bookingDates[1].format("DD/MM/YYYY")} <br />
          Number Of Nights: {calculateNumOfNights() } nights<br/>

          Price: ${totalPrice}<br/>
          <Button
            variant="outlined"
            onClick={submitBooking}
          >Book Now</Button>
        </Box>
      )}
    </Box>

  )

}
export default UsersBookingForm;