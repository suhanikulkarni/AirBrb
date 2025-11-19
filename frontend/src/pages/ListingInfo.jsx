import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import axios from 'axios';
import UsersBookingForm from './UserBookingForm';
import { Box, Modal, TextField, Tooltip } from '@mui/material';

import Rating from '@mui/material/Rating';

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
  const [open, setOpen] = useState(false);
  const [listingDetails, setListingDetails] = useState(null);

  const [reviewValue, setReviewValue] = useState(0);
  const [specificRatingReviews, setSpecificRatingReviews] = useState([])

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    console.log("Opennign")
    setOpen(true);
  };



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

  const filterReviews = () => {

    if (listingDetails) {
    // console.log(listingDetails)
    // console.log("console.log",listingDetails.reviews)

    const value = listingDetails.reviews.filter((review) => review.rating === reviewValue);
    console.log("plk",value)

    setSpecificRatingReviews(value);
}
  }

  useEffect(() => {
    filterReviews()

  },[reviewValue, listingDetails])


  return (
    <>
      {listingDetails && (
        <>
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
          <p>Number of Beds: {listingDetails?.metadata?.bedroomCount}</p>
          <p>Number of Bathrooms: {listingDetails?.metadata?.bathroomCount}</p>
          <p>Number of Beds: {sum}</p>
        </div>

        <Tooltip title='reviewValue'>
          <Rating value={reviewValue}
            onClick={handleOpen}
            onChange={(event, newValue) => setReviewValue(newValue)}></Rating>
        </Tooltip>
        </>
      )}

      {listingDetails && token && token !== 'LOADING' && (
        <UsersBookingForm 
          price={listingDetails.price} 
          listingId={id}
          token={token}
        />
      )}

      <Modal
          open={open}
          onClose={handleClose}
        >
        <Box sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <h2>Reviews with {reviewValue} stars</h2>

          {specificRatingReviews.map((review) => {
            return(<div>
              <p>{review.comment}</p>

            </div>)
          })}

          <button onClick={handleClose}>Close</button>
        </Box>
      </Modal>
     
    </>
  );
}

export default ListingInfo;