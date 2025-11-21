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

