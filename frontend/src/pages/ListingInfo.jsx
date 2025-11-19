import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import axios from 'axios';
import UsersBookingForm from './UserBookingForm';
import { Box, TextField } from '@mui/material';

const getListingInfo = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}listings/${id}`)
    console.log(response)
    if (response) {
      console.log("this is the response",response.data.listing)
      return response.data.listing;
    }
  }
  catch (error) {
    console.log("in the catch, there is an error", error.message);
  }
}

function ListingInfo({ token }) {
  const { id } = useParams();
  const [listingDetails, setListingDetails] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListingInfo(id);
      if (data) setListingDetails(data);
    };
    fetchListings();
  }, [id])

  let sum = 0;
  listingDetails?.metadata?.bedrooms?.forEach(element => {
    sum = sum+element.bedCount;
  });

  return (
    <>
      {listingDetails && (
        <div>
          <h2>Listing Info</h2>
          <p>Title: {listingDetails?.title}</p>
          <p>
          Address: 
            {listingDetails?.address?.streetAddress}, 
            {listingDetails?.address?.suburb}, 
            {listingDetails?.address?.postcode}, 
            {listingDetails?.address?.state}, 
            {listingDetails?.address?.country}
          </p>
          
          <p>Amenities: {listingDetails?.metadata?.amenities}</p>
          <p>Price: ${listingDetails?.price} per night</p>
          <p>Property Type: {listingDetails?.metadata?.propertyType}</p>
          {/* <p>Reviews: {listingDetails?.reviews}</p> */}
          <p>Number of Beds: {listingDetails?.metadata?.bedroomCount}</p>
          <p>Number of Bathrooms: {listingDetails?.metadata?.bathroomCount}</p>
          <p>Number of Beds: {sum}</p>
        </div>
      )}

      {listingDetails && token && token !== 'LOADING' && (
        <UsersBookingForm 
          price={listingDetails.price} 
          listingId={id}
          token={token}
        />
      )}
    </>
  );
}

export default ListingInfo;