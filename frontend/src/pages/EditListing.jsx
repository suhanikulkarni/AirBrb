import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, DEFAULT_IMAGE } from '../constants';
import { ErrorContext } from '../context';
import { Form, PageBody } from '../styles/mainStyles';
import Button from '@mui/material/Button';
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
  };

  const setters = {
    setListingInfo,
    setListingAddress,
    setListingMetadata,
    setThumbnailType
  };
  
  const postEditedListing = async (body, token) => {
    try {
      await axios.put(`${API_BASE_URL}listings/${listingId}`, body, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/dashboard');
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  const handleSave = async () => {
    if (!listingInfo.title || !listingInfo.price) {
      return setShowErrorPopup('Please fill out the whole form');
    }

    if (!listingAddress.country||!listingAddress.postcode||!listingAddress.state||!listingAddress.streetAddress||! listingAddress.suburb) {
      return setShowErrorPopup('Please enter all the address information');
    }

    if (!listingMetadata.bathroomCount||!listingMetadata.propertyType||!listingMetadata.bedroomCount) {
      return setShowErrorPopup('Please enter all the property information');
    }

    const bedNum = Number(listingMetadata.bedroomCount);
    
    if (bedNum > 0 && listingMetadata.bedrooms.length != bedNum) {
      return setShowErrorPopup('Please enter the bedroom information');
    }
    
    const priceNum = Number(listingInfo.price);
    const bathNum = Number(listingMetadata.bathroomCount);
    
    if (![priceNum, bathNum, bedNum].every(Number.isFinite)) {
      return setShowErrorPopup('Please insert a number');
    }
    
    let thumbnail = listingInfo.thumbnail;

    if (thumbnail && thumbnailType === 'youtube' && !thumbnail.startsWith('https://www.youtube.com/')) {
      return setShowErrorPopup('Invalid YouTube link');
    }
    
    if (!thumbnail) thumbnail = DEFAULT_IMAGE;

    const body = {
      ...listingInfo,
      address: listingAddress,
      metadata: listingMetadata,
      price: parseInt(listingInfo.price, 10),
      thumbnail: thumbnail
    };
  
    postEditedListing(body, token);
  }

  return (
    <PageBody>
      <h1>Edit Listing</h1>
      <Form>
        <ListingForm getters={getters} setters={setters} />
        <Button 
          variant='contained'
          onClick={handleSave}
        >Save</Button>
      </Form>
    </PageBody>
  )
}

export default EditListing