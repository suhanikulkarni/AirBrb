import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { ErrorContext } from '../context';
import Thumbnail from './Thumbnail';
import UsersBookingForm from './UserBookingForm';
import { PageBody } from '../styles/mainStyles';
import styles from '../styles/listingStyles.module.css';
import { Box, Modal, Tooltip } from '@mui/material';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';

function ListingInfo({ token }) {
  const { listingId } = useParams();
  const [open, setOpen] = useState(false);
  const [listingDetails, setListingDetails] = useState(null);
  const setShowErrorPopup = useContext(ErrorContext);
  const [reviewValue, setReviewValue] = useState(0);
  const [specificRatingReviews, setSpecificRatingReviews] = useState([]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListingInfo(listingId);
      if (data) setListingDetails(data);
    };
    fetchListings();
  }, [listingId]);

  let sum = 0;
  listingDetails?.metadata?.bedrooms?.forEach(element => {
    sum = sum+element.bedCount;
  });

  const filterReviews = () => {
    if (listingDetails) {
      const value = listingDetails.reviews.filter((review) => review.rating === reviewValue);
      setSpecificRatingReviews(value);
    }
  };

  const getListingInfo = async (listingId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}listings/${listingId}`);
      if (response) {
        return response.data.listing;
      }
    } catch (error) {
      setShowErrorPopup(error.response.data.error);

    }
  };

  const getBreakdownForStar = (starRating) => {
    if (!listingDetails?.reviews || !starRating) return null;
    
    const count = listingDetails.reviews.filter(r => r.rating === starRating).length;
    const total = listingDetails.reviews.length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    return { starRating, count, percentage };
  };

  useEffect(() => {
    filterReviews()
  },[reviewValue, listingDetails]);

  const breakdown = getBreakdownForStar(reviewValue);

  const tooltipContent = breakdown ? (
    <div>
      {breakdown.starRating} stars: {breakdown.percentage}% ({breakdown.count} reviews)
    </div>
  ) : '';

  return (
    <PageBody>
      {listingDetails && (
        <>
          <div>
            <h2>Listing Info</h2>
            <Thumbnail thumbnail={listingDetails?.thumbnail} listingTitle={listingDetails?.title} />
            <br /><br />

            <h3 className={styles.title}>Title: {listingDetails?.title}</h3>
            <p className={styles.subInfo}>
              {`Address: 
              ${listingDetails?.address?.streetAddress}, 
              ${listingDetails?.address?.suburb}, 
              ${listingDetails?.address?.postcode}, 
              ${listingDetails?.address?.state}, 
              ${listingDetails?.address?.country}`}
            </p>
            <br />
            
            <p className={styles.subInfo}>Price: ${listingDetails?.price} per night</p>
            <p className={styles.subInfo}>Amenities: {listingDetails?.metadata?.amenities}</p>
            <p className={styles.subInfo}>Property Type: {listingDetails?.metadata?.propertyType}</p>
            <br />

            <p className={styles.subInfo}>Number of Beds: {listingDetails?.metadata?.bedroomCount}</p>
            <p className={styles.subInfo}>Number of Bathrooms: {listingDetails?.metadata?.bathroomCount}</p>
            <p className={styles.subInfo}>Number of Beds: {sum}</p>
            <br />
            
            <p className={styles.subInfo}>Available dates:</p>
            {listingDetails.availability.map(av => (
              <p key={`${av.start}-${av.end}`} className={styles.subInfo}>{av.start} - {av.end}</p>
            ))}
          </div>
          <br />

          <Tooltip title={tooltipContent}>
            <p className={styles.subInfo}>Ratings (hover over the starts to see the ratings):</p>
            <Rating 
              value={reviewValue}
              onChangeActive={(event, newHover) => {
                setReviewValue(newHover);
              }}
              onClick={(event, newValue) => {
                handleOpen();
                if (newValue) {
                  setReviewValue(newValue);
                }
              }}
            />
          </Tooltip>
        </>
      )}
      
      <br />
      {listingDetails && token && token !== 'LOADING' && (
        <UsersBookingForm 
          price={listingDetails.price} 
          listingId={listingId}
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
          borderRadius: '10px',
          boxShadow: 24,
          p: 4,
          fontFamily: 'Calibri, sans-serif'
        }}>
          <h2>Reviews with {reviewValue} stars</h2>

          {specificRatingReviews.length > 0 ? (
            specificRatingReviews.map((review, index) => {
              return(
                <div key={index}>
                  <Rating value={review.rating} readOnly />
                  <p>{review.comment}</p>
                  <br />
                </div>
              )
            })
          ) : (
            <p>No reviews with {reviewValue} stars yet.</p>
          )}

          <Button variant='contained' onClick={handleClose}>Close</Button>
        </Box>
      </Modal>
    </PageBody>
  );
}

export default ListingInfo;