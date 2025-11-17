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
import { Box } from '@mui/material';
import BedroomForm from './BedroomForm';

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

  const [listingMetadata, setListingMetadata] = useState({
    'propertyType': '',
    'bathroomCount': '',
    'bedroomCount': '',
    'bedrooms': [],
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

  const handleInfo = (e) => {
    const {name, value} = e.target;

    setListingInfo((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleAddressInfo = (e) => {
    const {name, value} = e.target;
    setListingAddress((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  useEffect(() => {
      console.log("Updated address:", listingAddress);
    }, [listingAddress]);

  const handleMetadataInfo = (e) => {
    const {name, value} = e.target;
    console.log("name and vakue", name, value)

    setListingMetadata((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'bedroomCount') {
      renderBedroomForm();
    }
  }

    useEffect(() => {
      console.log("Updated metadata:", listingMetadata);
    }, [listingMetadata]);

  const updateBedroomMetadata = (bedroomNumber, bedroomInfo) => {
    setListingMetadata(prev => {
      const updated = [...prev.bedrooms];
      updated[bedroomNumber - 1] = bedroomInfo;
      return { ...prev, bedrooms: updated };
    });
  };

  const renderBedroomForm = () => {
    const array = [];

    for (let i = 1; i <= listingMetadata.bedroomCount; i++) {
      array.push(
        <BedroomForm
          key={i}
          bedroomNumber={i}
          updateBedroomMetadata={updateBedroomMetadata}
          />
      )
    }

    return array;
  }

  const handleSubmission = async () => {

    if (!listingInfo.title || !listingInfo.price) {
      // TODO: usability -> instead of popup -> highlight empty field with error
      return setShowErrorPopup("Please fill out the whole form");
    }
    if (!listingAddress.country||!listingAddress.postcode||!listingAddress.state||!listingAddress.streetAddress||! listingAddress.suburb) {
      return setShowErrorPopup("Please enter all the address information");
    }

    if (!listingMetadata.bathroomCount||!listingMetadata.propertyType||!listingMetadata.bedroomCount) {
      return setShowErrorPopup("Please enter all the information about the property");
    }
    const bedNum   = Number(listingMetadata.bedroomCount);
    if(bedNum > 0 && listingMetadata.bedrooms.length != bedNum) {
      return setShowErrorPopup("Please enter the bedroom information");
    }
    
    const priceNum = Number(listingInfo.price);
    const bathNum  = Number(listingMetadata.bathroomCount);
    

    if (![priceNum, bathNum, bedNum].every(Number.isFinite)) {
      console.log({ priceNum, bathNum, bedNum });
      return setShowErrorPopup("Please insert a number");
    }
        // TODO: default thumbnail

    const body = {
      ...listingInfo,
      address: listingAddress,
      metadata: listingMetadata,
      price: parseInt(listingInfo.price, 10)
    }
    console.log("Listing data: ",body)

    postListing(body, token);
  }

  useEffect(() => {
      console.log("Updated all info:", listingInfo);
    }, [listingInfo]);


}

export default CreateListing