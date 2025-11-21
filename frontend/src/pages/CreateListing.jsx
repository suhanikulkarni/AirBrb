import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';

import { Form, PageBody } from '../styles/mainStyles';
import Button from '@mui/material/Button';

import { ErrorContext } from '../context';


import ListingForm from './ListingForm';

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

  const [thumbnailType, setThumbnailType] = useState('image');

  const getters = {
    listingInfo,
    listingAddress,
    listingMetadata,
    thumbnailType
  }

  const setters = {
    setListingInfo,
    setListingAddress,
    setListingMetadata,
    setThumbnailType
  }

  const setShowErrorPopup = useContext(ErrorContext);
  
  const postListing = async (body, token) => {
    try {
      await axios.post(`${API_BASE_URL}listings/new`, body, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/dashboard');
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  useEffect(() => {
    console.log("Updated address:", listingAddress);
  }, [listingAddress]);

  useEffect(() => {
    console.log("Updated metadata:", listingMetadata);
  }, [listingMetadata]);
  
  useEffect(() => {
    console.log("Updated all info:", listingInfo);
  }, [listingInfo]);

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

    const bedNum = Number(listingMetadata.bedroomCount);
    
    if (bedNum > 0 && listingMetadata.bedrooms.length != bedNum) {
      return setShowErrorPopup("Please enter the bedroom information");
    }
    
    const priceNum = Number(listingInfo.price);
    const bathNum = Number(listingMetadata.bathroomCount);
    
    if (![priceNum, bathNum, bedNum].every(Number.isFinite)) {
      return setShowErrorPopup("Please insert a number");
    }
    
    let thumbnail = listingInfo.thumbnail;

    if (thumbnail && thumbnailType === "youtube" && !thumbnail.startsWith("https://www.youtube.com/")) {
      return setShowErrorPopup("Invalid YouTube link");
    };
    
    if (!thumbnail) thumbnail = DEFAULT_IMAGE;

    const body = {
      ...listingInfo,
      address: listingAddress,
      metadata: listingMetadata,
      price: parseInt(listingInfo.price, 10),
      thumbnail: thumbnail
    }

    console.log("Listing data: ",body)

    postListing(body, token);
  }


  return (
    <PageBody>
      <h1>Create Listing</h1>
      <Form>
        <ListingForm getters={getters} setters={setters} />
        <Button 
          variant="contained"
          onClick={handleSubmission}
        >Submit</Button>
      </Form>
    </PageBody>
  )
}

export default CreateListing