import { useEffect, useState } from 'react';

import { Box, Button, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import DatePicker from 'react-multi-date-picker';


function UsersBookingForm({price}) {
  const [bookingDates, setBookingDates] = useState();
  //const [totalPrice, setTotalPrice] = useState();
  // console.log("now im here@@@")

  useEffect(() => {
    // console.log("setDates", bookingDates)
  }, [bookingDates])
  
  const calculatePrice = () => {
    const bookingDays = bookingDates[1].day - bookingDates[0].day;
    const totalPrice = bookingDays * price

    return totalPrice;
  }
  const calculateNumOfNights = () => { return bookingDates[1].day - bookingDates[0].day;}

  const submitBooking = () => {
    console.log("Bookinh!!!")
  }

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

          Price: ${calculatePrice()}<br/>
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