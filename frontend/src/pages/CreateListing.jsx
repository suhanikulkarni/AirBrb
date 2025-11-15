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
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

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

  const [listingAddress, setListingAddress] = useState({
    'streetAddress': '',
    'suburb': '',
    'state': '',
    'country': '',
    'postcode': ''
  })

  const [metadata, setMetadata] = useState({
    'propertyType': '',
    'bathroomCount': '',
    'bedroom': [
      {
        'bedCount': '',
        'bedroomType': ''
      }
    ],
    'amenities': []
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

    // TODO: handle metadata/address structure

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
      // TODO: usability -> instead of popup -> highlight empty field with error
      return setShowErrorPopup("Please fill out the whole form");
    }

    listingInfo.price = parseInt(listingInfo.price, 10)
  
    if(!(Number.isFinite(listingInfo.price))){
      return setShowErrorPopup("Please insert a number");
    }

    // TODO: default thumbnail
    
    postListing(listingInfo, token);
  }

  return (
    <PageBody>
      <Form>
        <h1>Listing Information</h1>

        <TextField 
          id="outlined-search" 
          label="Property Name"
          type="search"
          onChange={handleChange}
          name="title"
          required
        />
        <br />

        <div>
          <TextField
            id="outlined-search"
            label="Street Address"
            type="search"
            onChange={handleChange}
            name="street"
            required
          />
          <br /><br />

          <TextField
            id="outlined-search"
            label="Suburb"
            type="search"
            onChange={handleChange}
            name="suburb"
            required
          />

          <TextField
            id="outlined-search"
            label="State"
            type="search"
            onChange={handleChange}
            name="state"
            required
          />
          <br /><br />

          <TextField
            id="outlined-search"
            label="Country"
            type="search"
            onChange={handleChange}
            name="country"
            required
          />

          <TextField
            id="outlined-search"
            label="Postcode"
            type="search"
            onChange={handleChange}
            name="postcode"
            required
          />
        </div>
        <br />

        <InputLabel htmlFor="outlined-adornment-amount">Amount *</InputLabel>
        <OutlinedInput
          id="outlined-adornment-amount"
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          label="Amount"
          name="price"
          onChange={handleChange}
          required
        />
        <br />
        
        {/* TODO: upload files into a directory */}
        {/* TODO: clear file upload */}
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
            name="thumbnail"
            multiple
          />
        </Button>
        <br />

        {/* TODO: create form elements for additional information */}
        <div>
          <FormControl fullWidth>
            <InputLabel id="property-type-label">Property Type</InputLabel>
            <Select
              labelId="property-type-label"
              id="property-type-select"
              value={metadata.propertyType}
              label="Property Type"
              onChange={handleChange}
            >
              <MenuItem value={"apartment"}>Apartment</MenuItem>
              <MenuItem value={"house"}>House</MenuItem>
              <MenuItem value={"guesthouse"}>Guesthouse</MenuItem>
              <MenuItem value={"hotelroom"}>Hotel Room</MenuItem>
              <MenuItem value={"cabin"}>Cabin</MenuItem>
              <MenuItem value={"other"}>Other</MenuItem>
            </Select>
          </FormControl>
          <br /><br />

          <TextField
            type="text"
            label="Amenities"
            multiline
            rows={3}
            name="amenities"
            onChange={handleChange}
          />
          <br /><br />
        </div>

        <Button 
          variant="contained"
          onClick={handleSubmission}
        >Submit</Button>
      </Form>
    </PageBody>
  )
}

export default CreateListing