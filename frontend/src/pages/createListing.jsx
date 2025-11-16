import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { fileToDataUrl } from '../helper';

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

const postListing = async (body, token) => {

  try {
    const response = await axios.post(
      `${API_BASE_URL}listings/new`, 
      body,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }
  catch (error) {
    console.log("in the catch, there is an error", error.message);
  }
}

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
  const [metadata, setMetadata] = useState({});
  
  const handleMetadata = (e) => {
    const {name, value} = e.target;
    setMetadata((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  const handleChange = async (e) => {
    const { name, value, files, type } = e.target;

    if (type === 'file' && files.length > 0) {
      const file = files[0];
      console.log("Selected file name:", file.name);
      const dataUrl = await fileToDataUrl(file);

      setListingInfo((prevData) => ({
        ...prevData,
        [name]: dataUrl,
      }));
    }

    else if (name === 'address') {
      setListingInfo((prevData) => ({
        ...prevData,
        [name]: {value}
      }))
    }
    else {
      setListingInfo((prevData) => ({
        ...prevData,
        [name]: value
      }))
    }
  }

  const handleSubmission = async () => {
    console.log("Listing data: ",listingInfo)

    if (!listingInfo.title || !listingInfo.address || !listingInfo.thumbnail || !listingInfo.price) {
      alert("Please fill out the whole form")
      return;
    }
    listingInfo.price = parseInt(listingInfo.price, 10);
    listingInfo.metadata = metadata;
  
    if(!(Number.isFinite(listingInfo.price))){
      alert("PLease insert a number")
      return
    }
    try {
      const response = await postListing(listingInfo, token);
      if (response) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.log("Submission failed:", error.message);
    }
  }
  return (
    <form>
      <h2>Listing Information</h2>
      <TextField 
        id="outlined-search" 
        label="Listing Title"
        type="search"
        onChange={handleChange}
        name='title'
      />
      <br />
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
      <br />

      <TextField
        id="outlined-search"
        label="Property Type"
        type="search"
        onChange={handleMetadata}
        name='type'
      />
      <br />
      <br />

      <TextField
        id="outlined-search"
        label="Number of Bedrooms"
        type="search"
        onChange={handleMetadata}
        name='bedrooms'
      />
      <br />
      <br />

      <TextField
        id="outlined-search"
        label="Number of Bathrooms"
        type="search"
        onChange={handleMetadata}
        name='bathrooms'
      />
      <br />
      <br />

      <TextField
        id="outlined-search"
        label="Property Amenities"
        type="search"
        onChange={handleMetadata}
        name='amenities'
      />
      <br />
      <br />

      <button type='button' onClick={handleSubmission}>Submit</button>
    </form>
  )
}

export default CreateListing