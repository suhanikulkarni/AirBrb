import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { useNavigate } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

import { Form, PageBody } from '../styles/mainStyles';

import { ErrorContext } from '../context';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function CreateListing({ token }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  const [listingInfo, setListingInfo] = useState({
    'title': '',
    'address': {},
    'price': 0,
    'thumbnail': '',
    'metadata': {}
  });

  const setShowErrorPopup = useContext(ErrorContext);

  const postListing = async (body, token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}listings/new`, body, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/dashboard');
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  const handleChange = (e) => {
    const {name, value} = e.target;

    if (name === 'address' || name === 'metadata') {
      setListingInfo((prevData) => ({
        ...prevData,
        [name]: {value}
      }))
    } else {
      setListingInfo((prevData) => ({
        ...prevData,
        [name]: value
      }))
    }
  }

  const handleSubmission = async () => {
    console.log("Listing data: ",listingInfo)

    if (!listingInfo.title || !listingInfo.address || !listingInfo.metadata || !listingInfo.thumbnail || !listingInfo.price) {
      return setShowErrorPopup("Please fill out the whole form");
    }

    listingInfo.price = parseInt(listingInfo.price, 10)
  
    if(!(Number.isFinite(listingInfo.price))){
      return setShowErrorPopup("Please insert a number");
    }
    
    postListing(listingInfo, token);
  }
  return (
    <PageBody>
      <Form>
        <h1>Listing Information</h1>

        <TextField 
          id="outlined-search" 
          label="Listing Title"
          type="search"
          onChange={handleChange}
          name='title'
        />
        <br />

        <TextField
          id="outlined-search"
          label="Listing Address"
          type="search"
          onChange={handleChange}
          name='address'
        />
        <br />

        <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
        <OutlinedInput
          id="outlined-adornment-amount"
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          label="Amount"
          name='price'
          onChange={handleChange}
        />
        <br />
        
        <label>Thumbnail&nbsp;&nbsp;</label>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}  
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            onChange={handleChange}
            name='thumbnail'
            multiple
          />
        </Button>
        <br />

        <TextField
          type='text'
          label="Additional Information"
          multiline
          rows={3}
          name='metadata'
          onChange={handleChange}
        />
        <br />

        <Button 
          variant="contained"
          onClick={handleSubmission}
        >Submit</Button>
      </Form>
    </PageBody>
  )
}

export default CreateListing