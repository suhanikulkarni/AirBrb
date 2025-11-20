import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_IMAGE } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';

import { PageBody } from '../styles/mainStyles';
import Button from '@mui/material/Button';

import { ErrorContext } from '../context';

import ListingForm from './ListingForm';

function EditListing({ token }) {
  const setShowErrorPopup = useContext(ErrorContext); 
  const navigate = useNavigate();
  const { listingId } = useParams();

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  const getListingInfo = async (listingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}listings/${listingId}`);
      if (response.data?.listing) return response.data?.listing;
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  useEffect(() => {
    const setInfo = async () => {
      const listingInfo = await getListingInfo(listingId);

      console.log('hi', listingId, listingInfo)
      setListingInfo(listingInfo);
      setListingAddress(listingInfo.address);
      setListingMetadata(listingInfo.metadata);
    }

    setInfo();
  }, []);

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
  
  const postEditedListing = async (body, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}listings/${listingId}`, body, {
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

  const handleSave = async () => {
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

    postEditedListing(body, token);
  }

  return (
    <PageBody>
      <h1>Edit Listing</h1>
      <ListingForm getters={getters} setters={setters} />
      <Button 
        variant="contained"
        onClick={handleSave}
      >Save</Button>
    </PageBody>
  )
}

export default EditListing